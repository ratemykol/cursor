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
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
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

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Trader = typeof traders.$inferSelect;
export type InsertTrader = z.infer<typeof insertTraderSchema>;
export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
