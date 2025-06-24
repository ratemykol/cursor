import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test database connection for logging
pool.query("SELECT NOW()")
  .then(() => console.log("✅ Connected to Postgres"))
  .catch((err) => console.error("❌ DB connection failed:", err));

export const db = drizzle(pool, { schema });