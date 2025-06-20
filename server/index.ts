import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Trust proxy for rate limiting in Replit environment
app.set('trust proxy', 1);

// Minimal security middleware - only in production
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
}

// Remove server signatures and identifying headers
app.disable('x-powered-by');

// Placeholder for CSP override - will be moved later

app.use((req, res, next) => {
  // Always remove identifying headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  // Only add restrictive security headers in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('Server-Timing', '');
  }
  
  next();
});

// Skip anti-doxxing middleware in development to prevent timing issues

// CORS configuration - permissive in development, strict in production
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: function (origin, callback) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
        process.env.ALLOWED_ORIGINS.split(',') : [];
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS policy'));
      }
    },
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));
} else {
  // Very permissive CORS for development
  app.use(cors({
    origin: true,
    credentials: true
  }));
}

// Rate limiting - disabled in development, enabled in production
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: "Too many requests from this IP, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(limiter);

  // Stricter rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 auth requests per windowMs
    message: {
      error: "Too many authentication attempts, please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/auth', authLimiter);
}

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Secure session configuration
const pgStore = connectPg(session);
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error("SESSION_SECRET environment variable is required in production");
}

const sessionSecret = process.env.SESSION_SECRET || 'development-session-secret-change-in-production';

app.use(session({
  store: new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: 'sessions',
  }),
  secret: sessionSecret as string,
  name: 'sessionId',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours instead of 1 week
    sameSite: 'strict', // CSRF protection
  },
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

// Skip MIME type middleware - will be handled by Vite in development

// Completely disable all CSP in development to prevent JavaScript blocking
app.use((req: Request, res: Response, next: NextFunction) => {
  // Remove all CSP headers that might block JavaScript execution
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('Content-Security-Policy-Report-Only');
  res.removeHeader('X-Content-Security-Policy');
  res.removeHeader('X-WebKit-CSP');
  
  // Also remove other restrictive headers in development
  if (process.env.NODE_ENV !== 'production') {
    res.removeHeader('X-Frame-Options');
    res.removeHeader('X-Content-Type-Options');
    res.removeHeader('X-XSS-Protection');
  }
  
  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Anti-doxxing error handler - hide all server information
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    // Log error internally but don't expose details
    const timestamp = new Date().toISOString();
    const errorId = Math.random().toString(36).substring(7);
    
    // Internal logging (remove in production or use secure logging service)
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${timestamp}] Error ${errorId}:`, err.message);
    }
    
    // Never expose real error details to prevent information leakage
    const genericMessages = [
      "Service temporarily unavailable",
      "Request could not be processed",
      "An error occurred while processing your request",
      "Service is currently experiencing issues",
      "Unable to complete request at this time"
    ];
    
    const randomMessage = genericMessages[Math.floor(Math.random() * genericMessages.length)];
    
    // Always return 503 to prevent status code enumeration
    res.status(503).json({ 
      error: randomMessage,
      timestamp: timestamp,
      reference: errorId
    });
  });

  // Setup static file serving with proper MIME types for production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // Add MIME type middleware before static serving
    app.use((req, res, next) => {
      if (req.url.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (req.url.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (req.url.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      next();
    });
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
