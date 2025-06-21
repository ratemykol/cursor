import {
  users,
  traders,
  ratings,
  reviewVotes,
  type User,
  type UpsertUser,
  type Trader,
  type InsertTrader,
  type Rating,
  type InsertRating,
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
  
  // Review vote operations
  voteOnReview(ratingId: number, userId: string, voteType: 'helpful' | 'not_helpful'): Promise<void>;
  getUserVoteOnReview(ratingId: number, userId: string): Promise<string | null>;
  getReviewVoteStats(ratingId: number): Promise<{ helpful: number; notHelpful: number }>;
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
    // Check if username already exists
    const existingUsername = await this.getUserByUsername(userData.username);
    if (existingUsername) {
      throw new Error("Username already exists");
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
      // Check if username is already taken by another user
      const existingUser = await db.select().from(users).where(eq(users.username, username));
      if (existingUser.length > 0 && existingUser[0].id !== userId) {
        throw new Error("Username is already taken");
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
}

export const storage = new DatabaseStorage();
