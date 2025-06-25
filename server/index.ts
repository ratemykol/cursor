import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import helmet from "helmet";
import rateLimit from 'express-rate-limit';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, desc } from 'drizzle-orm';
import { traders, ratings, users } from '../shared/schema.js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient } from '@neondatabase/serverless';
import pgSimple from 'connect-pg-simple';

import cors from "cors";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./static";

const app = express();

// Trust proxy for rate limiting in Replit environment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "wss:", "ws:"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  } : false, // Disable CSP in development for Vite compatibility
  crossOriginEmbedderPolicy: false,
}))

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.RENDER_EXTERNAL_URL,
      "https://testlivesite.onrender.com",
      "http://localhost:5173",
      "http://localhost:3000"
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin?.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow all origins for now, can be restricted later
    }
  },
  credentials: true
}));



// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

const pgStore = connectPg(session);
let sessionStore;

// Temporarily use memory store to fix authentication issue
// TODO: Debug PostgreSQL session store issue
console.log("🔄 Using memory session store for now to fix authentication");
sessionStore = undefined; // Force memory store

/*
try {
  sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // Enable auto-table creation for reliability
    tableName: 'sessions',
    ssl: {
      rejectUnauthorized: false // required for Render's managed DBs
    },
    // Add these options for better reliability
    pruneSessionInterval: false, // Disable automatic pruning
    ttl: 86400, // 24 hours in seconds
  });

  // Add error logging for PostgreSQL session store
  sessionStore.on('error', (err: any) => {
    console.error("❌ PG Session Store Error:", err);
  });

  console.log("✅ PostgreSQL session store initialized");
} catch (error) {
  console.error("❌ Failed to initialize PostgreSQL session store:", error);
  console.log("🔄 Falling back to memory session store");
  sessionStore = undefined; // Will use memory store
}
*/

// Session configuration based on environment
const sessionConfig = {
  name: 'sessionId',
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: false, // Set to false to allow HTTP cookies in development and testing
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    path: '/',
  }
};

console.log("🔧 Session config:", {
  secure: sessionConfig.cookie.secure,
  sameSite: sessionConfig.cookie.sameSite,
  name: sessionConfig.name,
  store: sessionStore ? 'PostgreSQL' : 'Memory',
  NODE_ENV: process.env.NODE_ENV
});

console.log("🚀 DEPLOYMENT TIMESTAMP:", new Date().toISOString());
console.log("🔧 FORCING NEW DEPLOYMENT - AUTH FIX v2");
console.log("🔧 This should show secure: false and sameSite: 'lax'");

app.use(session(sessionConfig));



app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const message = err.message || "Internal Server Error";
    console.error(message);
    
    // Only send response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).send("Something broke!");
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    try {
      const { setupVite } = await import("./vite");
      await setupVite(app, server);
    } catch (error) {
      console.log("Vite not available, falling back to static serving");
      serveStatic(app);
    }
  } else {
    serveStatic(app);
  }

  // Use environment PORT for production (Render, Heroku, etc.) or default to 5000 for development
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
