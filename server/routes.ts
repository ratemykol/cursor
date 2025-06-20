import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { body, validationResult, param, query } from "express-validator";
import { storage } from "./storage";
import { insertTraderSchema, insertRatingSchema, userRegistrationSchema, userLoginSchema } from "@shared/schema";
import { upload } from "./upload";
import path from "path";
import express from "express";

// Validation helper middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array()
    });
  }
  next();
};

// Security rate limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message: { error: "Too many uploads, please try again later." }
});

// Admin middleware to check if user is admin
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req.session as any)?.user;
    if (!user || !user.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const userData = await storage.getUser(user.id);
    if (!userData || userData.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: "Failed to verify admin status" });
  }
};

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const user = (req.session as any)?.user;
  if (!user || !user.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // File upload routes
  app.post("/api/upload/profile-picture", uploadLimiter, isAuthenticated, upload.single('profilePicture'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      
      // Update user's profile with new image URL
      const user = (req.session as any)?.user;
      const updatedUser = await storage.updateUserProfile(user.id, {
        profileImageUrl: fileUrl,
      });

      // Update session
      (req.session as any).user = {
        ...user,
        profileImageUrl: updatedUser.profileImageUrl,
      };

      res.json({ 
        message: "Profile picture uploaded successfully",
        profileImageUrl: fileUrl 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Trader profile picture upload
  app.post("/api/upload/trader-profile-picture", uploadLimiter, isAdmin, upload.single('profilePicture'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({ 
        message: "Trader profile picture uploaded successfully",
        profileImageUrl: fileUrl 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Trader routes with validation
  app.get("/api/traders", [
    query('q')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Search query too long')
      .trim()
      .escape(),
    handleValidationErrors
  ], async (req, res) => {
    try {
      const { q } = req.query;
      if (q && typeof q === "string") {
        const traders = await storage.searchTraders(q);
        res.json(traders);
      } else {
        const traders = await storage.getAllTraders();
        res.json(traders);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/traders/search/:query?", async (req, res) => {
    try {
      const query = req.params.query || req.query.q as string || '';
      if (!query.trim()) {
        const traders = await storage.getAllTraders();
        return res.json(traders);
      }
      const traders = await storage.searchTraders(query);
      res.json(traders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Name-only search endpoint for search page
  app.get("/api/traders/search-by-name", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string" || !q.trim()) {
        return res.json([]);
      }
      const traders = await storage.searchTradersByName(q.trim());
      res.json(traders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/traders/:id", [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Trader ID must be a positive integer'),
    handleValidationErrors
  ], async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trader = await storage.getTrader(id);
      
      if (!trader) {
        return res.status(404).json({ error: "Trader not found" });
      }
      
      const stats = await storage.getRatingStats(id);
      res.json({ ...trader, stats });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/traders", isAdmin, async (req, res) => {
    try {
      const validatedData = insertTraderSchema.parse(req.body);
      const trader = await storage.createTrader(validatedData);
      res.status(201).json(trader);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/traders/:id", isAdmin, async (req, res) => {
    try {
      const traderId = parseInt(req.params.id);
      if (isNaN(traderId)) {
        return res.status(400).json({ message: 'Invalid trader ID' });
      }

      const validatedData = insertTraderSchema.parse(req.body);
      const trader = await storage.updateTrader(traderId, validatedData);
      
      if (!trader) {
        return res.status(404).json({ message: 'Trader not found' });
      }
      
      res.json(trader);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/traders/:id", isAdmin, async (req, res) => {
    try {
      const traderId = parseInt(req.params.id);
      if (isNaN(traderId)) {
        return res.status(400).json({ message: 'Invalid trader ID' });
      }

      const success = await storage.deleteTrader(traderId);
      
      if (!success) {
        return res.status(404).json({ message: 'Trader not found' });
      }
      
      res.json({ message: 'Trader deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Rating routes
  app.get("/api/traders/:id/ratings", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ratings = await storage.getTraderRatings(id);
      res.json(ratings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/traders/:id/ratings", [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Trader ID must be a positive integer'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('strategy')
      .isInt({ min: 1, max: 5 })
      .withMessage('Strategy rating must be between 1 and 5'),
    body('communication')
      .isInt({ min: 1, max: 5 })
      .withMessage('Communication rating must be between 1 and 5'),
    body('reliability')
      .isInt({ min: 1, max: 5 })
      .withMessage('Reliability rating must be between 1 and 5'),
    body('profitability')
      .isInt({ min: 1, max: 5 })
      .withMessage('Profitability rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Comment must be less than 1000 characters')
      .trim()
      .escape(),
    handleValidationErrors
  ], async (req, res) => {
    try {
      // Check if user is authenticated
      const user = (req.session as any)?.user;
      if (!user) {
        return res.status(401).json({ error: "Authentication required to leave a review" });
      }

      const traderId = parseInt(req.params.id);
      const validatedData = insertRatingSchema.parse({
        ...req.body,
        traderId,
        userId: user.id,
      });
      const rating = await storage.createRating(validatedData);
      res.status(201).json(rating);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/traders/:id/stats", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const stats = await storage.getRatingStats(id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Check admin status endpoint
  app.get("/api/auth/admin-status", isAuthenticated, async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      const userData = await storage.getUser(user.id);
      res.json({ isAdmin: userData?.role === 'admin' });
    } catch (error) {
      res.status(500).json({ error: "Failed to check admin status" });
    }
  });

  // Admin routes for review management
  app.get("/api/admin/ratings", isAdmin, async (req, res) => {
    try {
      const ratings = await storage.getAllRatings();
      res.json(ratings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/ratings/:id", isAdmin, async (req, res) => {
    try {
      const ratingId = parseInt(req.params.id);
      if (isNaN(ratingId)) {
        return res.status(400).json({ message: 'Invalid rating ID' });
      }

      const validatedData = insertRatingSchema.partial().parse(req.body);
      const rating = await storage.updateRating(ratingId, validatedData);
      
      if (!rating) {
        return res.status(404).json({ message: 'Rating not found' });
      }
      
      res.json(rating);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/ratings/:id", isAdmin, async (req, res) => {
    try {
      const ratingId = parseInt(req.params.id);
      if (isNaN(ratingId)) {
        return res.status(400).json({ message: 'Invalid rating ID' });
      }

      const success = await storage.deleteRating(ratingId);
      
      if (!success) {
        return res.status(404).json({ message: 'Rating not found' });
      }
      
      res.json({ message: 'Rating deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Authentication routes with validation
  app.post("/api/auth/register", [
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores')
      .trim()
      .escape(),
    body('email')
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6, max: 128 })
      .withMessage('Password must be between 6 and 128 characters'),
    handleValidationErrors
  ], async (req, res) => {
    try {
      const userData = userRegistrationSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Check if email already exists (only if email is provided)
      if (userData.email && userData.email.trim() !== "") {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }
      
      const user = await storage.registerUser(userData);
      
      // Remove password hash from response
      const { passwordHash, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ error: "Validation error", details: error.issues });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", [
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .trim()
      .escape(),
    body('password')
      .isLength({ min: 1, max: 128 })
      .withMessage('Password is required'),
    handleValidationErrors
  ], async (req, res) => {
    try {
      const credentials = userLoginSchema.parse(req.body);
      const user = await storage.authenticateUser(credentials);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Store user in session
      (req.session as any).user = {
        id: user.id,
        username: user.username,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        authType: user.authType,
      };
      
      // Remove password hash from response
      const { passwordHash, ...userResponse } = user;
      res.json(userResponse);
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ error: "Validation error", details: error.issues });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    const user = (req.session as any)?.user;
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json(user);
  });

  app.put("/api/auth/profile", async (req, res) => {
    const user = (req.session as any)?.user;
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { email, bio, profileImageUrl } = req.body;
      
      const updatedUser = await storage.updateUserProfile(user.id, {
        email,
        bio,
        profileImageUrl,
      });

      // Update session with new user data
      (req.session as any).user = {
        ...user,
        email: updatedUser.email,
        bio: updatedUser.bio,
        profileImageUrl: updatedUser.profileImageUrl,
      };

      res.json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
