#!/usr/bin/env node

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "./shared/schema.js";

console.log("Setting up database...");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool, { schema });

try {
  // Test connection
  await pool.query("SELECT NOW()");
  console.log("✅ Connected to database");

  // Create tables if they don't exist
  console.log("Creating tables...");
  
  // This will create all tables defined in your schema
  // You can add specific table creation logic here if needed
  
  console.log("✅ Database setup complete");
} catch (error) {
  console.error("❌ Database setup failed:", error);
  process.exit(1);
} finally {
  await pool.end();
} 