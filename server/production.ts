import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./static";

const app = express();

// Trust proxy for rate limiting in production environment
app.set('trust proxy', 1);

// Production security middleware
app.use(helmet({
  contentSecurityPolicy: {
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
  },
  crossOriginEmbedderPolicy: false,
  hidePoweredBy: true,
  frameguard: { action: 'deny' },
  noSniff: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  xssFilter: true,
  referrerPolicy: { policy: 'no-referrer' }
}));

// Remove server signatures and identifying headers
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Server-Timing', '');
  next();
});

// CORS configuration for production - allow all origins for broader compatibility
app.use(cors({
  origin: true,
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Rate limiting with simple fallback to avoid IP validation errors
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting if IP is invalid to prevent crashes
    return !req.ip || req.ip === 'xxx.xxx.xxx.xxx';
  }
});

app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many authentication attempts, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting if IP is invalid to prevent crashes
    return !req.ip || req.ip === 'xxx.xxx.xxx.xxx';
  }
});

app.use('/api/auth', authLimiter);

// Simple middleware without IP obfuscation for production stability
app.use((req, res, next) => {
  delete req.headers['x-real-ip'];
  delete req.headers['x-forwarded-host'];
  delete req.headers['x-forwarded-proto'];
  delete req.headers['x-forwarded-port'];
  delete req.headers['forwarded'];
  delete req.headers['via'];
  delete req.headers['x-cluster-client-ip'];
  delete req.headers['cf-connecting-ip'];
  delete req.headers['true-client-ip'];
  delete req.headers['x-original-forwarded-for'];
  
  next();
});

// Server fingerprinting protection
app.use((req, res, next) => {
  res.setHeader('Server', 'nginx');
  const delay = Math.floor(Math.random() * 50);
  setTimeout(() => {
    next();
  }, delay);
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Session configuration
const pgStore = connectPg(session);
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required in production");
}

app.use(session({
  store: new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: 'sessions',
  }),
  secret: process.env.SESSION_SECRET,
  name: 'connect.sid',
  resave: true, // Force session save
  saveUninitialized: true, // Save uninitialized sessions
  rolling: true,
  cookie: {
    secure: false, // Set to false for broader hosting compatibility
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    sameSite: 'lax', // Use 'lax' for better compatibility
    domain: undefined, // Let browser handle domain automatically
  },
}));

// Logging middleware
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

  // Error handler
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const errorId = Math.random().toString(36).substring(7);
    
    const genericMessages = [
      "Service temporarily unavailable",
      "Request could not be processed",
      "An error occurred while processing your request",
      "Service is currently experiencing issues",
      "Unable to complete request at this time"
    ];
    
    const randomMessage = genericMessages[Math.floor(Math.random() * genericMessages.length)];
    
    res.status(503).json({ 
      error: randomMessage,
      timestamp: timestamp,
      reference: errorId
    });
  });

  // Serve static files in production - NO VITE
  serveStatic(app);

  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();