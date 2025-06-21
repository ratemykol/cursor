import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { body, validationResult, param, query } from "express-validator";
import { storage } from "./storage";
import { insertTraderSchema, insertRatingSchema, userRegistrationSchema, userLoginSchema } from "@shared/schema";
import { upload } from "./upload";
import path from "path";
import express from "express";

// Helper function to extract Twitter username from URL
function extractTwitterUsername(twitterUrl: string): string | null {
  if (!twitterUrl) return null;
  
  try {
    // Match various Twitter URL formats
    const patterns = [
      /twitter\.com\/([^\/\?]+)/i,
      /x\.com\/([^\/\?]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = twitterUrl.match(pattern);
      if (match && match[1]) {
        return match[1].replace('@', '');
      }
    }
    
    // If it's just a username without URL
    if (twitterUrl.startsWith('@')) {
      return twitterUrl.substring(1);
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting Twitter username:', error);
    return null;
  }
}

// Helper function to fetch Twitter profile image
async function fetchTwitterProfileImage(username: string): Promise<string | null> {
  try {
    // Use a public service to get Twitter profile images
    // This uses the Twitter profile image URL pattern which is publicly accessible
    const profileImageUrl = `https://unavatar.io/twitter/${username}`;
    
    // Verify the image exists by making a HEAD request
    const response = await fetch(profileImageUrl, { method: 'HEAD' });
    
    if (response.ok) {
      return profileImageUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Twitter profile image:', error);
    return null;
  }
}

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

// Rate limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 uploads per minute
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
  ], async (req: Request, res: Response) => {
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
      
      // Auto-fetch Twitter profile image if Twitter URL is provided and no profile image is set
      if (validatedData.twitterUrl && !validatedData.profileImage) {
        const username = extractTwitterUsername(validatedData.twitterUrl);
        if (username) {
          const twitterProfileImage = await fetchTwitterProfileImage(username);
          if (twitterProfileImage) {
            validatedData.profileImage = twitterProfileImage;
          }
        }
      }
      
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
      
      // Auto-fetch Twitter profile image if Twitter URL is provided and no profile image is set
      if (validatedData.twitterUrl && !validatedData.profileImage) {
        const username = extractTwitterUsername(validatedData.twitterUrl);
        if (username) {
          const twitterProfileImage = await fetchTwitterProfileImage(username);
          if (twitterProfileImage) {
            validatedData.profileImage = twitterProfileImage;
          }
        }
      }
      
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

  app.post("/api/traders/:id/refresh-twitter-image", isAdmin, async (req, res) => {
    try {
      const traderId = parseInt(req.params.id);
      if (isNaN(traderId)) {
        return res.status(400).json({ message: 'Invalid trader ID' });
      }

      const trader = await storage.getTrader(traderId);
      if (!trader) {
        return res.status(404).json({ message: 'Trader not found' });
      }

      if (!trader.twitterUrl) {
        return res.status(400).json({ message: 'No Twitter URL found for this trader' });
      }

      const username = extractTwitterUsername(trader.twitterUrl);
      if (!username) {
        return res.status(400).json({ message: 'Invalid Twitter URL format' });
      }

      const twitterProfileImage = await fetchTwitterProfileImage(username);
      if (!twitterProfileImage) {
        return res.status(404).json({ message: 'Could not fetch Twitter profile image' });
      }

      const updatedTrader = await storage.updateTrader(traderId, {
        ...trader,
        profileImage: twitterProfileImage
      });

      res.json({ 
        message: 'Twitter profile image updated successfully',
        trader: updatedTrader 
      });
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
    body('overallRating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Overall rating must be between 1 and 5'),
    body('strategyRating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Strategy rating must be between 1 and 5'),
    body('communicationRating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Communication rating must be between 1 and 5'),
    body('reliabilityRating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Reliability rating must be between 1 and 5'),
    body('profitabilityRating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Profitability rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Comment must be less than 1000 characters')
      .trim()
      .escape(),
    body('reviewerName')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Reviewer name must be less than 100 characters')
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
      
      // Check if user has already reviewed this trader
      const existingRating = await storage.getUserRating(user.id, traderId);
      if (existingRating) {
        return res.status(400).json({ 
          error: "Only one review is allowed per user!" 
        });
      }
      
      // Use the request body directly as it matches the database schema
      const ratingData = {
        traderId,
        userId: user.id,
        reviewerName: req.body.reviewerName || user.username || 'Anonymous',
        overallRating: req.body.overallRating,
        strategyRating: req.body.strategyRating,
        communicationRating: req.body.communicationRating,
        reliabilityRating: req.body.reliabilityRating,
        profitabilityRating: req.body.profitabilityRating,
        comment: req.body.comment || null,
        tags: req.body.tags || []
      };
      
      const validatedData = insertRatingSchema.parse(ratingData);
      const rating = await storage.createRating(validatedData);
      
      // Check and award badges after rating submission for both user and trader
      const newUserBadges = await storage.checkAndAwardBadges(user.id);
      const newTraderBadges = await storage.checkAndAwardTraderBadges(traderId);
      
      res.status(201).json({ 
        rating, 
        newBadges: newUserBadges.length > 0 ? newUserBadges : undefined,
        newTraderBadges: newTraderBadges.length > 0 ? newTraderBadges : undefined
      });
    } catch (error: any) {
      console.error('Rating validation error:', error);
      res.status(400).json({ 
        error: "Validation failed", 
        details: error.message,
        received: req.body 
      });
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

  // User reviews management routes
  app.get("/api/user/reviews", isAuthenticated, async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      const reviews = await storage.getUserRatings(user.id);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/user/reviews/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      const reviewId = parseInt(req.params.id);
      
      // First get the existing review to verify ownership
      const existingReviews = await storage.getUserRatings(user.id);
      const existingReview = existingReviews.find((review: any) => review.id === reviewId);
      
      if (!existingReview) {
        return res.status(403).json({ error: "You can only edit your own reviews" });
      }

      const updatedReview = await storage.updateRating(reviewId, {
        overallRating: req.body.overallRating,
        strategyRating: req.body.strategyRating,
        communicationRating: req.body.communicationRating,
        reliabilityRating: req.body.reliabilityRating,
        profitabilityRating: req.body.profitabilityRating,
        comment: req.body.comment,
        tags: req.body.tags || []
      });

      res.json(updatedReview);
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

  // Review voting endpoints
  app.post("/api/reviews/:id/vote", isAuthenticated, async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      const reviewId = parseInt(req.params.id);
      const { voteType } = req.body;

      if (!['helpful', 'not_helpful'].includes(voteType)) {
        return res.status(400).json({ error: "Invalid vote type" });
      }

      await storage.voteOnReview(reviewId, user.id, voteType);
      const stats = await storage.getReviewVoteStats(reviewId);
      const userVote = await storage.getUserVoteOnReview(reviewId, user.id);

      res.json({ 
        ...stats,
        userVote 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reviews/:id/vote-status", async (req, res) => {
    try {
      const reviewId = parseInt(req.params.id);
      const user = (req.session as any)?.user;
      
      const stats = await storage.getReviewVoteStats(reviewId);
      let userVote = null;
      
      if (user) {
        userVote = await storage.getUserVoteOnReview(reviewId, user.id);
      }

      res.json({ 
        ...stats,
        userVote 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
      .matches(/^[a-zA-Z0-9_.-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, dots, and hyphens')
      .trim(),
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
        bio: user.bio,
        profileImageUrl: user.profileImageUrl,
        authType: user.authType,
        role: user.role,
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
        role: updatedUser.role,
      };

      res.json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin User Management Routes
  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/users/:userId', isAdmin, [
    param('userId').notEmpty().withMessage('User ID is required'),
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .trim()
      .escape(),
    handleValidationErrors
  ], async (req, res) => {
    try {
      const { userId } = req.params;
      const { username } = req.body;
      
      const updatedUser = await storage.updateUserUsername(userId, username);
      res.json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Badge system routes
  app.get('/api/badges/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const badges = await storage.getUserBadges(userId);
      res.json(badges);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/badges/progress/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const progress = await storage.getBadgeProgress(userId);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/badges/check/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const newBadges = await storage.checkAndAwardBadges(userId);
      res.json(newBadges);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Trader badge system routes
  app.get('/api/trader-badges/:traderId', async (req, res) => {
    try {
      const traderId = parseInt(req.params.traderId);
      const badges = await storage.getTraderBadges(traderId);
      res.json(badges);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/trader-badges/progress/:traderId', async (req, res) => {
    try {
      const traderId = parseInt(req.params.traderId);
      const progress = await storage.getTraderBadgeProgress(traderId);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/trader-badges/check/:traderId', async (req, res) => {
    try {
      const traderId = parseInt(req.params.traderId);
      const newBadges = await storage.checkAndAwardTraderBadges(traderId);
      res.json(newBadges);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Trader user profile management routes
  app.post("/api/auth/register-trader", [
    body('username')
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9._-]+$/)
      .withMessage('Username can only contain letters, numbers, dots, hyphens, and underscores'),
    body('email')
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('name')
      .isLength({ min: 1, max: 100 })
      .withMessage('Trader name is required'),
    body('walletAddress')
      .isLength({ min: 1, max: 255 })
      .withMessage('Wallet address is required'),
    handleValidationErrors
  ], async (req: Request, res: Response) => {
    try {
      const userData = {
        username: req.body.username,
        email: req.body.email || "",
        password: req.body.password,
        userType: "trader" as const
      };

      const traderData = {
        name: req.body.name,
        walletAddress: req.body.walletAddress,
        bio: req.body.bio || "",
        twitterUrl: req.body.twitterUrl || "",
        profileImageUrl: req.body.profileImageUrl || ""
      };

      const { user, trader } = await storage.createTraderUser(userData, traderData);
      
      // Store user session
      (req.session as any).user = {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        role: user.role,
        userType: user.userType,
        traderId: user.traderId
      };

      res.json({
        message: "Trader account created successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          userType: user.userType,
          traderId: user.traderId
        },
        trader: {
          id: trader.id,
          name: trader.name,
          walletAddress: trader.walletAddress
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get trader profile for authenticated trader user
  app.get("/api/user/trader-profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = (req.session as any)?.user;
      if (user.userType !== "trader") {
        return res.status(403).json({ error: "Access denied. Only trader accounts can access trader profiles." });
      }
      
      const traderProfile = await storage.getUserTraderProfile(user.id);
      if (!traderProfile) {
        return res.status(404).json({ error: "Trader profile not found" });
      }
      
      res.json(traderProfile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update trader profile for authenticated trader user
  app.put("/api/user/trader-profile", isAuthenticated, [
    body('name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Trader name must be between 1 and 100 characters'),
    body('walletAddress')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('Wallet address must be between 1 and 255 characters'),
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio must be less than 500 characters'),
    body('twitterUrl')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Twitter URL must be less than 255 characters'),
    handleValidationErrors
  ], async (req: Request, res: Response) => {
    try {
      const user = (req.session as any)?.user;
      if (user.userType !== "trader") {
        return res.status(403).json({ error: "Access denied. Only trader accounts can edit trader profiles." });
      }
      
      const updatedTrader = await storage.updateUserTraderProfile(user.id, req.body);
      if (!updatedTrader) {
        return res.status(404).json({ error: "Trader profile not found" });
      }
      
      res.json({
        message: "Trader profile updated successfully",
        trader: updatedTrader
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
