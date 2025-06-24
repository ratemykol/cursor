import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import cors from "cors";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./static";

const app = express();

// Trust proxy for production environment
app.set('trust proxy', 1);

// Basic CORS configuration for production
app.use(cors({
  origin: true, // Allow all origins in production for now
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Basic security headers without strict CSP
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Session configuration
const pgStore = connectPg(session);

app.use(session({
  store: new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: 'sessions',
  }),
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
  name: 'sessionId',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: false, // Set to false for HTTP in development/testing
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
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
    console.error('Production error:', err);
    res.status(500).json({ 
      error: "Internal server error"
    });
  });

  // Serve static files in production - NO VITE
  serveStatic(app);

  const port = process.env.PORT || 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();