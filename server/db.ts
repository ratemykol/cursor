import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Test database connection for logging
pool.query("SELECT NOW()")
  .then(() => console.log("✅ Connected to Postgres"))
  .catch((err) => console.error("❌ DB connection failed:", err));

export const db = drizzle({ client: pool, schema });