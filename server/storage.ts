import {
  users,
  traders,
  ratings,
  reviewVotes,
  userBadges,
  traderBadges,
  type User,
  type UpsertUser,
  type Trader,
  type InsertTrader,
  type Rating,
  type InsertRating,
  type UserBadge,
  type InsertUserBadge,
  type TraderBadge,
  type InsertTraderBadge,
  type UserRegistration,
  type UserLogin,
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { eq, or, ilike, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  registerUser(userData: UserRegistration): Promise<User>;
  authenticateUser(credentials: UserLogin): Promise<User | null>;
  updateUserProfile(userId: string, profileData: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserUsername(userId: string, username: string): Promise<User>;
  
  // Trader operations
  getTrader(id: number): Promise<Trader | undefined>;
  getTraderByWallet(walletAddress: string): Promise<Trader | undefined>;
  searchTraders(query: string): Promise<any[]>;
  searchTradersByName(query: string): Promise<any[]>;
  createTrader(trader: InsertTrader): Promise<Trader>;
  updateTrader(id: number, trader: InsertTrader): Promise<Trader | undefined>;
  deleteTrader(id: number): Promise<boolean>;
  getAllTraders(): Promise<any[]>;
  
  // Rating operations
  createRating(rating: InsertRating): Promise<Rating>;
  getTraderRatings(traderId: number): Promise<Rating[]>;
  getAllRatings(): Promise<Rating[]>;
  updateRating(id: number, rating: Partial<InsertRating>): Promise<Rating | undefined>;
  deleteRating(id: number): Promise<boolean>;
  getRatingStats(traderId: number): Promise<{
    averageRating: number;
    totalRatings: number;
    averageStrategy: number;
    averageCommunication: number;
    averageReliability: number;
    averageProfitability: number;
    fiveStarCount: number;
  }>;
  getUserRating(userId: string, traderId: number): Promise<Rating | undefined>;
  getUserRatings(userId: string): Promise<Rating[]>;
  checkUsernameExists(username: string, excludeUserId?: string): Promise<boolean>;
  
  // Review vote operations
  voteOnReview(ratingId: number, userId: string, voteType: 'helpful' | 'not_helpful'): Promise<void>;
  getUserVoteOnReview(ratingId: number, userId: string): Promise<string | null>;
  getReviewVoteStats(ratingId: number): Promise<{ helpful: number; notHelpful: number }>;
  
  // Badge operations
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(userId: string, badgeType: string, badgeLevel?: number, metadata?: any): Promise<UserBadge>;
  checkAndAwardBadges(userId: string): Promise<UserBadge[]>;
  getBadgeProgress(userId: string): Promise<any>;
  
  // Trader badge operations
  getTraderBadges(traderId: number): Promise<TraderBadge[]>;
  awardTraderBadge(traderId: number, badgeType: string, badgeLevel?: number, metadata?: any): Promise<TraderBadge>;
  checkAndAwardTraderBadges(traderId: number): Promise<TraderBadge[]>;
  getTraderBadgeProgress(traderId: number): Promise<any>;
  getBadgeRarityStats(): Promise<{ [badgeType: string]: { count: number; percentage: number; rarity: string } }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async registerUser(userData: UserRegistration): Promise<User> {
    // Check if username already exists (case-insensitive)
    const existingUsername = await this.checkUsernameExists(userData.username);
    if (existingUsername) {
      throw new Error("Username Taken!");
    }

    // Check if email already exists (if email is provided)
    if (userData.email && userData.email.trim() !== "") {
      const existingEmail = await this.getUserByEmail(userData.email);
      if (existingEmail) {
        throw new Error("Email already exists");
      }
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);
    
    // Generate a unique ID for local users
    const userId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        username: userData.username,
        email: userData.email && userData.email.trim() !== "" ? userData.email : null,
        passwordHash,
        authType: "local",
      })
      .returning();
    return user;
  }

  async authenticateUser(credentials: UserLogin): Promise<User | null> {
    const user = await this.getUserByUsername(credentials.username);
    if (!user || !user.passwordHash) {
      return null;
    }
    
    const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isValidPassword) {
      return null;
    }
    
    return user;
  }

  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Trader operations
  async getTrader(id: number): Promise<Trader | undefined> {
    const [trader] = await db.select().from(traders).where(eq(traders.id, id));
    return trader;
  }

  async getTraderByWallet(walletAddress: string): Promise<Trader | undefined> {
    const [trader] = await db
      .select()
      .from(traders)
      .where(eq(traders.walletAddress, walletAddress));
    return trader;
  }

  async searchTraders(query: string): Promise<any[]> {
    let traderList;
    
    if (!query || query.trim().length === 0) {
      traderList = await db.select().from(traders).limit(10);
    } else {
      const searchTerm = query.trim();
      traderList = await db
        .select()
        .from(traders)
        .where(
          or(
            ilike(traders.name, `%${searchTerm}%`),
            ilike(traders.walletAddress, `%${searchTerm}%`)
          )
        )
        .limit(10);
    }

    // Add rating statistics to each trader
    const tradersWithStats = await Promise.all(
      traderList.map(async (trader) => {
        const stats = await this.getRatingStats(trader.id);
        return {
          ...trader,
          averageRating: stats.averageRating,
          totalRatings: stats.totalRatings,
          fiveStarCount: stats.fiveStarCount,
          featured: false // You can add logic for featured traders later
        };
      })
    );

    // Sort traders by rating: highest average rating first, then by most 5-star reviews for ties
    tradersWithStats.sort((a, b) => {
      console.log(`Comparing ${a.name} (${a.averageRating}, 5-star: ${a.fiveStarCount}) vs ${b.name} (${b.averageRating}, 5-star: ${b.fiveStarCount})`);
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      return b.fiveStarCount - a.fiveStarCount;
    });

    console.log('Final sorted order:', tradersWithStats.map(t => `${t.name}: ${t.averageRating} (${t.fiveStarCount} 5-star)`));
    return tradersWithStats;
  }

  async searchTradersByName(query: string): Promise<any[]> {
    const searchTerm = query.trim();
    const traderList = await db
      .select()
      .from(traders)
      .where(ilike(traders.name, `%${searchTerm}%`))
      .limit(10);

    // Add rating statistics to each trader
    const tradersWithStats = await Promise.all(
      traderList.map(async (trader) => {
        const stats = await this.getRatingStats(trader.id);
        return {
          ...trader,
          averageRating: stats.averageRating,
          totalRatings: stats.totalRatings,
          fiveStarCount: stats.fiveStarCount,
          featured: false
        };
      })
    );

    // Sort traders by rating: highest average rating first, then by most 5-star reviews for ties
    tradersWithStats.sort((a, b) => {
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      return b.fiveStarCount - a.fiveStarCount;
    });

    return tradersWithStats;
  }

  async createTrader(trader: InsertTrader): Promise<Trader> {
    const [newTrader] = await db
      .insert(traders)
      .values(trader)
      .returning();
    return newTrader;
  }

  async updateTrader(id: number, traderData: InsertTrader): Promise<Trader | undefined> {
    const [updatedTrader] = await db
      .update(traders)
      .set(traderData)
      .where(eq(traders.id, id))
      .returning();
    return updatedTrader;
  }

  async deleteTrader(id: number): Promise<boolean> {
    try {
      // First delete all ratings associated with this trader
      await db.delete(ratings).where(eq(ratings.traderId, id));
      
      // Then delete the trader
      const deletedTraders = await db.delete(traders).where(eq(traders.id, id)).returning();
      
      return deletedTraders.length > 0;
    } catch (error) {
      console.error('Error deleting trader:', error);
      return false;
    }
  }

  async getAllTraders(): Promise<any[]> {
    const traderList = await db.select().from(traders);
    
    // Add rating statistics to each trader
    const tradersWithStats = await Promise.all(
      traderList.map(async (trader) => {
        const stats = await this.getRatingStats(trader.id);
        return {
          ...trader,
          averageRating: stats.averageRating,
          totalRatings: stats.totalRatings,
          fiveStarCount: stats.fiveStarCount,
          featured: false
        };
      })
    );

    // Sort traders by rating: highest average rating first, then by most 5-star reviews for ties
    tradersWithStats.sort((a, b) => {
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      return b.fiveStarCount - a.fiveStarCount;
    });

    return tradersWithStats;
  }

  // Rating operations
  async createRating(rating: InsertRating): Promise<Rating> {
    const [newRating] = await db
      .insert(ratings)
      .values(rating)
      .returning();
    return newRating;
  }

  async getTraderRatings(traderId: number): Promise<any[]> {
    return await db
      .select({
        id: ratings.id,
        traderId: ratings.traderId,
        userId: ratings.userId,
        reviewerName: ratings.reviewerName,
        overallRating: ratings.overallRating,
        strategyRating: ratings.strategyRating,
        communicationRating: ratings.communicationRating,
        reliabilityRating: ratings.reliabilityRating,
        profitabilityRating: ratings.profitabilityRating,
        comment: ratings.comment,
        tags: ratings.tags,
        helpful: ratings.helpful,
        notHelpful: ratings.notHelpful,
        createdAt: ratings.createdAt,
        updatedAt: ratings.updatedAt,
        userProfileImage: users.profileImageUrl,
      })
      .from(ratings)
      .leftJoin(users, eq(ratings.userId, users.id))
      .where(eq(ratings.traderId, traderId))
      .orderBy(desc(ratings.createdAt));
  }

  async getRatingStats(traderId: number): Promise<{
    averageRating: number;
    totalRatings: number;
    averageStrategy: number;
    averageCommunication: number;
    averageReliability: number;
    averageProfitability: number;
    fiveStarCount: number;
  }> {
    const traderRatings = await this.getTraderRatings(traderId);
    
    if (traderRatings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        averageStrategy: 0,
        averageCommunication: 0,
        averageReliability: 0,
        averageProfitability: 0,
        fiveStarCount: 0,
      };
    }

    const totalRatings = traderRatings.length;
    const fiveStarCount = traderRatings.filter(r => Number(r.overallRating) === 5).length;
    const averageRating = traderRatings.reduce((sum, r) => sum + Number(r.overallRating), 0) / totalRatings;
    const averageStrategy = traderRatings.reduce((sum, r) => sum + Number(r.strategyRating), 0) / totalRatings;
    const averageCommunication = traderRatings.reduce((sum, r) => sum + Number(r.communicationRating), 0) / totalRatings;
    const averageReliability = traderRatings.reduce((sum, r) => sum + Number(r.reliabilityRating), 0) / totalRatings;
    const averageProfitability = traderRatings.reduce((sum, r) => sum + Number(r.profitabilityRating), 0) / totalRatings;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      averageStrategy: Math.round(averageStrategy * 10) / 10,
      averageCommunication: Math.round(averageCommunication * 10) / 10,
      averageReliability: Math.round(averageReliability * 10) / 10,
      averageProfitability: Math.round(averageProfitability * 10) / 10,
      fiveStarCount,
    };
  }

  async getAllRatings(): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .orderBy(desc(ratings.createdAt));
  }

  async updateRating(id: number, ratingData: Partial<InsertRating>): Promise<Rating | undefined> {
    const [updatedRating] = await db
      .update(ratings)
      .set(ratingData)
      .where(eq(ratings.id, id))
      .returning();
    return updatedRating;
  }

  async deleteRating(id: number): Promise<boolean> {
    const result = await db
      .delete(ratings)
      .where(eq(ratings.id, id))
      .returning();
    return result.length > 0;
  }

  // User management methods
  async getAllUsers(): Promise<User[]> {
    try {
      const allUsers = await db.select().from(users).orderBy(users.createdAt);
      return allUsers;
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  async updateUserUsername(userId: string, username: string): Promise<User> {
    try {
      // Check if username is already taken by another user (case-insensitive)
      const usernameExists = await this.checkUsernameExists(username, userId);
      if (usernameExists) {
        throw new Error("Username Taken!");
      }

      const [updatedUser] = await db
        .update(users)
        .set({ 
          username,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        throw new Error("User not found");
      }

      return updatedUser;
    } catch (error) {
      console.error("Error updating username:", error);
      throw error;
    }
  }

  async getUserRating(userId: string, traderId: number): Promise<Rating | undefined> {
    const [rating] = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.userId, userId), eq(ratings.traderId, traderId)));
    return rating;
  }

  async getUserRatings(userId: string): Promise<any[]> {
    return await db
      .select({
        id: ratings.id,
        traderId: ratings.traderId,
        userId: ratings.userId,
        reviewerName: ratings.reviewerName,
        overallRating: ratings.overallRating,
        strategyRating: ratings.strategyRating,
        communicationRating: ratings.communicationRating,
        reliabilityRating: ratings.reliabilityRating,
        profitabilityRating: ratings.profitabilityRating,
        comment: ratings.comment,
        tags: ratings.tags,
        helpful: ratings.helpful,
        notHelpful: ratings.notHelpful,
        createdAt: ratings.createdAt,
        updatedAt: ratings.updatedAt,
        traderName: traders.name,
        traderWallet: traders.walletAddress,
      })
      .from(ratings)
      .leftJoin(traders, eq(ratings.traderId, traders.id))
      .where(eq(ratings.userId, userId))
      .orderBy(desc(ratings.createdAt));
  }

  async checkUsernameExists(username: string, excludeUserId?: string): Promise<boolean> {
    if (excludeUserId) {
      const result = await db
        .select({ id: users.id })
        .from(users)
        .where(and(
          sql`LOWER(${users.username}) = LOWER(${username})`,
          sql`${users.id} != ${excludeUserId}`
        ))
        .limit(1);
      return result.length > 0;
    } else {
      const result = await db
        .select({ id: users.id })
        .from(users)
        .where(sql`LOWER(${users.username}) = LOWER(${username})`)
        .limit(1);
      return result.length > 0;
    }
  }

  // Review vote operations
  async voteOnReview(ratingId: number, userId: string, voteType: 'helpful' | 'not_helpful'): Promise<void> {
    await db.transaction(async (tx) => {
      // Check if user already voted on this review
      const existingVote = await tx
        .select()
        .from(reviewVotes)
        .where(and(eq(reviewVotes.ratingId, ratingId), eq(reviewVotes.userId, userId)))
        .limit(1);

      if (existingVote.length > 0) {
        const currentVote = existingVote[0];
        
        // If same vote type, remove the vote (toggle off)
        if (currentVote.voteType === voteType) {
          await tx
            .delete(reviewVotes)
            .where(eq(reviewVotes.id, currentVote.id));
          
          // Update counter
          if (voteType === 'helpful') {
            await tx
              .update(ratings)
              .set({ helpful: sql`${ratings.helpful} - 1` })
              .where(eq(ratings.id, ratingId));
          } else {
            await tx
              .update(ratings)
              .set({ notHelpful: sql`${ratings.notHelpful} - 1` })
              .where(eq(ratings.id, ratingId));
          }
        } else {
          // Change vote type
          await tx
            .update(reviewVotes)
            .set({ voteType })
            .where(eq(reviewVotes.id, currentVote.id));
          
          // Update counters (subtract old, add new)
          if (voteType === 'helpful') {
            await tx
              .update(ratings)
              .set({ 
                helpful: sql`${ratings.helpful} + 1`,
                notHelpful: sql`${ratings.notHelpful} - 1`
              })
              .where(eq(ratings.id, ratingId));
          } else {
            await tx
              .update(ratings)
              .set({ 
                helpful: sql`${ratings.helpful} - 1`,
                notHelpful: sql`${ratings.notHelpful} + 1`
              })
              .where(eq(ratings.id, ratingId));
          }
        }
      } else {
        // New vote
        await tx
          .insert(reviewVotes)
          .values({
            ratingId,
            userId,
            voteType
          });
        
        // Update counter
        if (voteType === 'helpful') {
          await tx
            .update(ratings)
            .set({ helpful: sql`${ratings.helpful} + 1` })
            .where(eq(ratings.id, ratingId));
        } else {
          await tx
            .update(ratings)
            .set({ notHelpful: sql`${ratings.notHelpful} + 1` })
            .where(eq(ratings.id, ratingId));
        }
      }
    });
  }

  async getUserVoteOnReview(ratingId: number, userId: string): Promise<string | null> {
    const vote = await db
      .select({ voteType: reviewVotes.voteType })
      .from(reviewVotes)
      .where(and(eq(reviewVotes.ratingId, ratingId), eq(reviewVotes.userId, userId)))
      .limit(1);
    
    return vote.length > 0 ? vote[0].voteType : null;
  }

  async getReviewVoteStats(ratingId: number): Promise<{ helpful: number; notHelpful: number }> {
    const stats = await db
      .select({
        helpful: ratings.helpful,
        notHelpful: ratings.notHelpful
      })
      .from(ratings)
      .where(eq(ratings.id, ratingId))
      .limit(1);
    
    if (stats.length > 0) {
      return { 
        helpful: Number(stats[0].helpful) || 0, 
        notHelpful: Number(stats[0].notHelpful) || 0 
      };
    }
    return { helpful: 0, notHelpful: 0 };
  }

  // Badge system operations
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const result = await db.execute(
      sql`SELECT * FROM user_badges WHERE user_id = ${userId} ORDER BY earned_at DESC`
    );
    return result.rows as UserBadge[];
  }

  async awardBadge(userId: string, badgeType: string, badgeLevel: number = 1, metadata: any = null): Promise<UserBadge> {
    try {
      // Use raw SQL to avoid Drizzle field name issues
      const result = await db.execute(
        sql`INSERT INTO user_badges (user_id, badge_type, badge_level, metadata) 
            VALUES (${userId}, ${badgeType}, ${badgeLevel}, ${JSON.stringify(metadata)}) 
            RETURNING *`
      );
      return result.rows[0] as UserBadge;
    } catch (error) {
      // Handle duplicate badge error (already exists)
      if (error instanceof Error && error.message.includes('duplicate key')) {
        // Return existing badge
        const existingResult = await db.execute(
          sql`SELECT * FROM user_badges 
              WHERE user_id = ${userId} AND badge_type = ${badgeType} AND badge_level = ${badgeLevel}
              LIMIT 1`
        );
        return existingResult.rows[0] as UserBadge;
      }
      throw error;
    }
  }

  async checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
    const newBadges: UserBadge[] = [];
    
    // Get user's rating count and stats
    const userRatings = await this.getUserRatings(userId);
    const reviewCount = userRatings.length;
    
    // Get user's existing badges
    const existingBadges = await this.getUserBadges(userId);
    const badgeTypes = existingBadges.map(b => `${b.badgeType}_${b.badgeLevel}`);
    
    // First Review Badge
    if (reviewCount >= 1 && !badgeTypes.includes('first_review_1')) {
      const badge = await this.awardBadge(userId, 'first_review', 1);
      newBadges.push(badge);
    }
    
    // Prolific Reviewer Badges (Bronze: 5, Silver: 15, Gold: 30)
    if (reviewCount >= 5 && !badgeTypes.includes('prolific_reviewer_1')) {
      const badge = await this.awardBadge(userId, 'prolific_reviewer', 1, { reviewCount });
      newBadges.push(badge);
    }
    if (reviewCount >= 15 && !badgeTypes.includes('prolific_reviewer_2')) {
      const badge = await this.awardBadge(userId, 'prolific_reviewer', 2, { reviewCount });
      newBadges.push(badge);
    }
    if (reviewCount >= 30 && !badgeTypes.includes('prolific_reviewer_3')) {
      const badge = await this.awardBadge(userId, 'prolific_reviewer', 3, { reviewCount });
      newBadges.push(badge);
    }
    
    // Detailed Reviewer Badge (for reviews with comments over 80 chars)
    const detailedReviews = userRatings.filter(r => r.comment && r.comment.length > 80);
    if (detailedReviews.length >= 5 && !badgeTypes.includes('detailed_reviewer_1')) {
      const badge = await this.awardBadge(userId, 'detailed_reviewer', 1, { detailedCount: detailedReviews.length });
      newBadges.push(badge);
    }
    
    // Helpful Reviewer Badge (based on helpful votes received)
    const helpfulVotes = userRatings.reduce((sum, r) => sum + (r.helpful || 0), 0);
    if (helpfulVotes >= 10 && !badgeTypes.includes('helpful_reviewer_1')) {
      const badge = await this.awardBadge(userId, 'helpful_reviewer', 1, { helpfulVotes });
      newBadges.push(badge);
    }
    if (helpfulVotes >= 25 && !badgeTypes.includes('helpful_reviewer_2')) {
      const badge = await this.awardBadge(userId, 'helpful_reviewer', 2, { helpfulVotes });
      newBadges.push(badge);
    }
    if (helpfulVotes >= 50 && !badgeTypes.includes('helpful_reviewer_3')) {
      const badge = await this.awardBadge(userId, 'helpful_reviewer', 3, { helpfulVotes });
      newBadges.push(badge);
    }
    

    
    // Early Adopter Badge (for users who joined early)
    const user = await this.getUser(userId);
    if (user && user.createdAt) {
      const joinDate = new Date(user.createdAt);
      const cutoffDate = new Date('2025-06-21'); // Platform launch date
      if (joinDate <= cutoffDate && !badgeTypes.includes('early_adopter_1')) {
        const badge = await this.awardBadge(userId, 'early_adopter', 1);
        newBadges.push(badge);
      }
    }
    
    return newBadges;
  }

  async getBadgeProgress(userId: string): Promise<any> {
    const userRatings = await this.getUserRatings(userId);
    const reviewCount = userRatings.length;
    const helpfulVotes = userRatings.reduce((sum, r) => sum + (r.helpful || 0), 0);
    const detailedReviews = userRatings.filter(r => r.comment && r.comment.length > 80).length;
    const avgRating = reviewCount > 0 ? userRatings.reduce((sum, r) => sum + r.overallRating, 0) / reviewCount : 0;
    
    return {
      reviewCount,
      helpfulVotes,
      detailedReviews,
      avgRating: avgRating.toFixed(2),
      progress: {
        firstReview: reviewCount >= 1,
        prolificReviewer: {
          bronze: reviewCount >= 5,
          silver: reviewCount >= 15,
          gold: reviewCount >= 30
        },
        helpfulReviewer: {
          bronze: helpfulVotes >= 10,
          silver: helpfulVotes >= 25,
          gold: helpfulVotes >= 50
        },
        detailedReviewer: detailedReviews >= 5
      }
    };
  }

  // Trader badge system operations
  async getTraderBadges(traderId: number): Promise<TraderBadge[]> {
    const badges = await db
      .select()
      .from(traderBadges)
      .where(eq(traderBadges.traderId, traderId))
      .orderBy(desc(traderBadges.earnedAt));
    
    // Filter to only show the highest level badge for each badge type
    const badgeMap = new Map<string, TraderBadge>();
    
    for (const badge of badges) {
      const existingBadge = badgeMap.get(badge.badgeType);
      const badgeLevel = badge.badgeLevel ?? 0;
      const existingLevel = existingBadge?.badgeLevel ?? 0;
      if (!existingBadge || badgeLevel > existingLevel) {
        badgeMap.set(badge.badgeType, badge);
      }
    }
    
    return Array.from(badgeMap.values()).sort((a, b) => {
      const dateA = a.earnedAt ? new Date(a.earnedAt).getTime() : 0;
      const dateB = b.earnedAt ? new Date(b.earnedAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async awardTraderBadge(traderId: number, badgeType: string, badgeLevel: number = 1, metadata: any = null): Promise<TraderBadge> {
    try {
      const result = await db.execute(
        sql`INSERT INTO trader_badges (trader_id, badge_type, badge_level, metadata) 
            VALUES (${traderId}, ${badgeType}, ${badgeLevel}, ${JSON.stringify(metadata)}) 
            RETURNING *`
      );
      return result.rows[0] as TraderBadge;
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        const existingResult = await db.execute(
          sql`SELECT * FROM trader_badges 
              WHERE trader_id = ${traderId} AND badge_type = ${badgeType} AND badge_level = ${badgeLevel}
              LIMIT 1`
        );
        return existingResult.rows[0] as TraderBadge;
      }
      throw error;
    }
  }

  async checkAndAwardTraderBadges(traderId: number): Promise<TraderBadge[]> {
    const newBadges: TraderBadge[] = [];
    
    // Get trader's rating stats
    const stats = await this.getRatingStats(traderId);
    const traderRatings = await this.getTraderRatings(traderId);
    
    // Get trader's existing badges
    const existingBadges = await this.getTraderBadges(traderId);
    const badgeTypes = existingBadges.map(b => `${b.badgeType}_${b.badgeLevel}`);
    
    // Rising Star Badge (for new traders with good ratings)
    if (stats.totalRatings >= 5 && stats.averageRating >= 4.5 && !badgeTypes.includes('rising_star_1')) {
      const badge = await this.awardTraderBadge(traderId, 'rising_star', 1, { 
        avgRating: stats.averageRating, 
        totalRatings: stats.totalRatings 
      });
      newBadges.push(badge);
    }

    // Top Performer Badges (Bronze: 4.0+, Silver: 4.5+, Gold: 4.8+)
    if (stats.totalRatings >= 10) {
      if (stats.averageRating >= 4.0 && !badgeTypes.includes('top_performer_1')) {
        const badge = await this.awardTraderBadge(traderId, 'top_performer', 1, { avgRating: stats.averageRating });
        newBadges.push(badge);
      }
      if (stats.averageRating >= 4.5 && !badgeTypes.includes('top_performer_2')) {
        const badge = await this.awardTraderBadge(traderId, 'top_performer', 2, { avgRating: stats.averageRating });
        newBadges.push(badge);
      }
      if (stats.averageRating >= 4.8 && !badgeTypes.includes('top_performer_3')) {
        const badge = await this.awardTraderBadge(traderId, 'top_performer', 3, { avgRating: stats.averageRating });
        newBadges.push(badge);
      }
    }

    // Community Favorite Badge (lots of reviews)
    if (stats.totalRatings >= 25 && !badgeTypes.includes('community_favorite_1')) {
      const badge = await this.awardTraderBadge(traderId, 'community_favorite', 1, { totalRatings: stats.totalRatings });
      newBadges.push(badge);
    }
    if (stats.totalRatings >= 50 && !badgeTypes.includes('community_favorite_2')) {
      const badge = await this.awardTraderBadge(traderId, 'community_favorite', 2, { totalRatings: stats.totalRatings });
      newBadges.push(badge);
    }
    if (stats.totalRatings >= 100 && !badgeTypes.includes('community_favorite_3')) {
      const badge = await this.awardTraderBadge(traderId, 'community_favorite', 3, { totalRatings: stats.totalRatings });
      newBadges.push(badge);
    }

    // Consistent Gains Badge (high profitability rating)
    if (stats.totalRatings >= 10 && stats.averageProfitability >= 4.5 && !badgeTypes.includes('consistent_gains_1')) {
      const badge = await this.awardTraderBadge(traderId, 'consistent_gains', 1, { 
        avgProfitability: stats.averageProfitability 
      });
      newBadges.push(badge);
    }

    // Diamond Hands Badge (high five-star count)
    if (stats.fiveStarCount >= 20 && !badgeTypes.includes('diamond_hands_1')) {
      const badge = await this.awardTraderBadge(traderId, 'diamond_hands', 1, { fiveStarCount: stats.fiveStarCount });
      newBadges.push(badge);
    }

    // Veteran Trader Badge (been around long enough with consistent performance)
    if (stats.totalRatings >= 30 && stats.averageRating >= 4.0 && !badgeTypes.includes('veteran_trader_1')) {
      const badge = await this.awardTraderBadge(traderId, 'veteran_trader', 1, { 
        totalRatings: stats.totalRatings,
        avgRating: stats.averageRating
      });
      newBadges.push(badge);
    }

    return newBadges;
  }

  async getTraderBadgeProgress(traderId: number): Promise<any> {
    const stats = await this.getRatingStats(traderId);
    const badges = await this.getTraderBadges(traderId);
    
    return {
      averageRating: stats.averageRating,
      totalRatings: stats.totalRatings,
      fiveStarCount: stats.fiveStarCount,
      averageProfitability: stats.averageProfitability,
      badges: badges,
      progress: {
        risingStar: stats.totalRatings >= 5 && stats.averageRating >= 4.5,
        topPerformer: {
          bronze: stats.totalRatings >= 10 && stats.averageRating >= 4.0,
          silver: stats.totalRatings >= 10 && stats.averageRating >= 4.5,
          gold: stats.totalRatings >= 10 && stats.averageRating >= 4.8
        },
        communityFavorite: {
          bronze: stats.totalRatings >= 25,
          silver: stats.totalRatings >= 50,
          gold: stats.totalRatings >= 100
        },
        consistentGains: stats.totalRatings >= 10 && stats.averageProfitability >= 4.5,
        diamondHands: stats.fiveStarCount >= 20,
        veteranTrader: stats.totalRatings >= 30 && stats.averageRating >= 4.0
      }
    };
  }

  async getBadgeRarityStats(): Promise<{ [badgeType: string]: { count: number; percentage: number; rarity: string } }> {
    // Get total number of traders
    const totalTraders = await db.execute(sql`SELECT COUNT(DISTINCT id) as count FROM traders`);
    const traderCount = totalTraders.rows[0]?.count as number || 1;

    // Get badge statistics - count unique traders per badge type
    const badgeStats = await db.execute(sql`
      SELECT 
        badge_type, 
        COUNT(DISTINCT trader_id) as unique_holders
      FROM trader_badges 
      GROUP BY badge_type
    `);

    const stats: { [badgeType: string]: { count: number; percentage: number; rarity: string } } = {};

    for (const row of badgeStats.rows) {
      const badgeType = row.badge_type as string;
      const count = row.unique_holders as number;
      const percentage = (count / traderCount) * 100;
      
      // Determine rarity based on percentage
      let rarity = 'Common';
      if (percentage <= 1) rarity = 'Legendary';
      else if (percentage <= 5) rarity = 'Epic';
      else if (percentage <= 15) rarity = 'Rare';
      else if (percentage <= 35) rarity = 'Uncommon';

      stats[badgeType] = {
        count,
        percentage: Math.round(percentage * 10) / 10,
        rarity
      };
    }

    return stats;
  }
}

export const storage = new DatabaseStorage();
