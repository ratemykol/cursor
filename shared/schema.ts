import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  serial,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  username: varchar("username", { length: 50 }).unique(),
  email: varchar("email").unique(),
  passwordHash: varchar("password_hash", { length: 255 }),

  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  role: varchar("role", { length: 20 }).default("user"), // "admin" or "user"
  authType: varchar("auth_type", { length: 20 }).default("replit"), // "replit" or "local"
  reviewStreak: integer("review_streak").default(0), // Current consecutive days with reviews
  maxReviewStreak: integer("max_review_streak").default(0), // Highest streak achieved
  totalReviews: integer("total_reviews").default(0), // Total number of reviews written
  lastReviewDate: timestamp("last_review_date"), // Date of last review for streak calculation
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Crypto traders table
export const traders = pgTable("traders", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  walletAddress: varchar("wallet_address", { length: 100 }).notNull().unique(),
  bio: text("bio"),
  profileImage: varchar("profile_image", { length: 500 }),
  specialty: varchar("specialty", { length: 255 }),
  verified: boolean("verified").default(false),
  twitterUrl: varchar("twitter_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ratings table
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  traderId: integer("trader_id").notNull().references(() => traders.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  reviewerName: varchar("reviewer_name").notNull(),
  overallRating: integer("overall_rating").notNull(),
  strategyRating: integer("strategy_rating").notNull(),
  communicationRating: integer("communication_rating").notNull(),
  reliabilityRating: integer("reliability_rating").notNull(),
  profitabilityRating: integer("profitability_rating").notNull(),
  comment: text("comment"),
  tags: text("tags").array(),
  helpful: integer("helpful").default(0),
  notHelpful: integer("not_helpful").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User badges/achievements table
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeType: varchar("badge_type", { length: 50 }).notNull(), // "streak_3", "streak_7", "streak_30", "reviewer_10", etc.
  badgeName: varchar("badge_name", { length: 100 }).notNull(), // "3-Day Streak", "Week Warrior", etc.
  badgeDescription: text("badge_description").notNull(),
  badgeIcon: varchar("badge_icon", { length: 100 }).notNull(), // emoji or icon identifier
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Relations
export const tradersRelations = relations(traders, ({ many }) => ({
  ratings: many(ratings),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  trader: one(traders, {
    fields: [ratings.traderId],
    references: [traders.id],
  }),
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  ratings: many(ratings),
  badges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertTraderSchema = createInsertSchema(traders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  helpful: true,
  notHelpful: true,
});

// Authentication schemas
export const userRegistrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username must be less than 50 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const userLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Trader = typeof traders.$inferSelect;
export type InsertTrader = z.infer<typeof insertTraderSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;
