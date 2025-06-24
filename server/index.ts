import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import helmet from "helmet";

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
  origin: "https://testlivesite.onrender.com", // your frontend domain
  credentials: true
}));



// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

const pgStore = connectPg(session);
const sessionStore = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true, // Enable auto-table creation for reliability
  tableName: 'sessions',
  ssl: {
    rejectUnauthorized: false // required for Render's managed DBs
  }
});

// Add error logging for PostgreSQL session store
sessionStore.on('error', (err: any) => {
  console.error("❌ PG Session Store Error:", err);
});

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  rolling: true, // Extend session on activity
  cookie: {
    secure: true,               // Required on Render (HTTPS)
    httpOnly: true,
    sameSite: "none",           // For cross-origin requests
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));



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
