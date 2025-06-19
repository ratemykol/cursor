import {
  users,
  traders,
  ratings,
  type User,
  type UpsertUser,
  type Trader,
  type InsertTrader,
  type Rating,
  type InsertRating,
} from "@shared/schema";
import { db } from "./db";
import { eq, or, ilike, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Trader operations
  getTrader(id: number): Promise<Trader | undefined>;
  getTraderByWallet(walletAddress: string): Promise<Trader | undefined>;
  searchTraders(query: string): Promise<Trader[]>;
  createTrader(trader: InsertTrader): Promise<Trader>;
  getAllTraders(): Promise<Trader[]>;
  
  // Rating operations
  createRating(rating: InsertRating): Promise<Rating>;
  getTraderRatings(traderId: number): Promise<Rating[]>;
  getRatingStats(traderId: number): Promise<{
    averageRating: number;
    totalRatings: number;
    averageDifficulty: number;
    wouldTakeAgainPercentage: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

  async searchTraders(query: string): Promise<Trader[]> {
    return await db
      .select()
      .from(traders)
      .where(
        or(
          ilike(traders.name, `%${query}%`),
          ilike(traders.walletAddress, `%${query}%`)
        )
      )
      .limit(10);
  }

  async createTrader(trader: InsertTrader): Promise<Trader> {
    const [newTrader] = await db
      .insert(traders)
      .values(trader)
      .returning();
    return newTrader;
  }

  async getAllTraders(): Promise<Trader[]> {
    return await db.select().from(traders).orderBy(desc(traders.createdAt));
  }

  // Rating operations
  async createRating(rating: InsertRating): Promise<Rating> {
    const [newRating] = await db
      .insert(ratings)
      .values(rating)
      .returning();
    return newRating;
  }

  async getTraderRatings(traderId: number): Promise<Rating[]> {
    return await db
      .select()
      .from(ratings)
      .where(eq(ratings.traderId, traderId))
      .orderBy(desc(ratings.createdAt));
  }

  async getRatingStats(traderId: number): Promise<{
    averageRating: number;
    totalRatings: number;
    averageDifficulty: number;
    wouldTakeAgainPercentage: number;
  }> {
    const traderRatings = await this.getTraderRatings(traderId);
    
    if (traderRatings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        averageDifficulty: 0,
        wouldTakeAgainPercentage: 0,
      };
    }

    const totalRatings = traderRatings.length;
    const averageRating = traderRatings.reduce((sum, r) => sum + Number(r.overallRating), 0) / totalRatings;
    const averageDifficulty = traderRatings.reduce((sum, r) => sum + Number(r.difficulty), 0) / totalRatings;
    const wouldTakeAgainCount = traderRatings.filter(r => r.wouldTakeAgain).length;
    const wouldTakeAgainPercentage = (wouldTakeAgainCount / totalRatings) * 100;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      averageDifficulty: Math.round(averageDifficulty * 10) / 10,
      wouldTakeAgainPercentage: Math.round(wouldTakeAgainPercentage),
    };
  }
}

export const storage = new DatabaseStorage();
