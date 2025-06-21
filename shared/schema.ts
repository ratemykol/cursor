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
  unique,
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
  userType: varchar("user_type", { length: 20 }).default("user"), // "user" or "trader"
  traderId: integer("trader_id").references(() => traders.id), // Link to trader profile if user is a trader
  authType: varchar("auth_type", { length: 20 }).default("replit"), // "replit" or "local"
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
}, (table) => ({
  // Unique constraint: one review per user per trader
  uniqueUserTrader: unique().on(table.userId, table.traderId),
}));

// Review votes table to track helpfulness votes
export const reviewVotes = pgTable("review_votes", {
  id: serial("id").primaryKey(),
  ratingId: integer("rating_id").notNull().references(() => ratings.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  voteType: varchar("vote_type", { enum: ["helpful", "not_helpful"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Unique constraint: one vote per user per review
  uniqueUserRating: unique().on(table.userId, table.ratingId),
}));

// User badges table for gamification
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeType: varchar("badge_type", { 
    enum: [
      "first_review", "helpful_reviewer", "prolific_reviewer", "expert_reviewer", 
      "trusted_reviewer", "detailed_reviewer", "early_adopter", "community_builder",
      "top_contributor", "veteran_reviewer", "quality_reviewer"
    ] 
  }).notNull(),
  badgeLevel: integer("badge_level").default(1), // Bronze=1, Silver=2, Gold=3
  earnedAt: timestamp("earned_at").defaultNow(),
  metadata: jsonb("metadata"), // Store additional data like count thresholds
}, (table) => ({
  // Unique constraint: one badge type per user per level
  uniqueUserBadgeLevel: unique().on(table.userId, table.badgeType, table.badgeLevel),
}));

// Trader badges table for gamification
export const traderBadges = pgTable("trader_badges", {
  id: serial("id").primaryKey(),
  traderId: integer("trader_id").notNull().references(() => traders.id),
  badgeType: varchar("badge_type", { 
    enum: [
      "rising_star", "top_performer", "consistent_gains", "volume_leader", 
      "community_favorite", "veteran_trader", "alpha_caller", "risk_manager",
      "trend_setter", "diamond_hands", "accuracy_expert", "market_wizard"
    ] 
  }).notNull(),
  badgeLevel: integer("badge_level").default(1), // Bronze=1, Silver=2, Gold=3
  earnedAt: timestamp("earned_at").defaultNow(),
  metadata: jsonb("metadata"), // Store additional data like performance metrics
}, (table) => ({
  // Unique constraint: one badge type per trader per level
  uniqueTraderBadgeLevel: unique().on(table.traderId, table.badgeType, table.badgeLevel),
}));

// Relations
export const tradersRelations = relations(traders, ({ many }) => ({
  ratings: many(ratings),
  badges: many(traderBadges),
}));

export const ratingsRelations = relations(ratings, ({ one, many }) => ({
  trader: one(traders, {
    fields: [ratings.traderId],
    references: [traders.id],
  }),
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  votes: many(reviewVotes),
}));

export const reviewVotesRelations = relations(reviewVotes, ({ one }) => ({
  rating: one(ratings, {
    fields: [reviewVotes.ratingId],
    references: [ratings.id],
  }),
  user: one(users, {
    fields: [reviewVotes.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  ratings: many(ratings),
  reviewVotes: many(reviewVotes),
  badges: many(userBadges),
  traderProfile: one(traders, {
    fields: [users.traderId],
    references: [traders.id],
  }),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
}));

export const traderBadgesRelations = relations(traderBadges, ({ one }) => ({
  trader: one(traders, {
    fields: [traderBadges.traderId],
    references: [traders.id],
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

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

export const insertTraderBadgeSchema = createInsertSchema(traderBadges).omit({
  id: true,
  earnedAt: true,
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
export type ReviewVote = typeof reviewVotes.$inferSelect;
export type InsertReviewVote = typeof reviewVotes.$inferInsert;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type TraderBadge = typeof traderBadges.$inferSelect;
export type InsertTraderBadge = z.infer<typeof insertTraderBadgeSchema>;
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
