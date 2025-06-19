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
import { eq, or, ilike, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Trader operations
  getTrader(id: number): Promise<Trader | undefined>;
  getTraderByWallet(walletAddress: string): Promise<Trader | undefined>;
  searchTraders(query: string): Promise<any[]>;
  createTrader(trader: InsertTrader): Promise<Trader>;
  updateTrader(id: number, trader: InsertTrader): Promise<Trader | undefined>;
  deleteTrader(id: number): Promise<boolean>;
  getAllTraders(): Promise<any[]>;
  
  // Rating operations
  createRating(rating: InsertRating): Promise<Rating>;
  getTraderRatings(traderId: number): Promise<Rating[]>;
  getRatingStats(traderId: number): Promise<{
    averageRating: number;
    totalRatings: number;
    averageStrategy: number;
    averageCommunication: number;
    averageReliability: number;
    averageProfitability: number;
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
          featured: false // You can add logic for featured traders later
        };
      })
    );

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
    const traderList = await db.select().from(traders).orderBy(desc(traders.createdAt));
    
    // Add rating statistics to each trader
    const tradersWithStats = await Promise.all(
      traderList.map(async (trader) => {
        const stats = await this.getRatingStats(trader.id);
        return {
          ...trader,
          averageRating: stats.averageRating,
          totalRatings: stats.totalRatings,
          featured: false
        };
      })
    );

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
    averageStrategy: number;
    averageCommunication: number;
    averageReliability: number;
    averageProfitability: number;
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
      };
    }

    const totalRatings = traderRatings.length;
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
    };
  }
}

export const storage = new DatabaseStorage();
