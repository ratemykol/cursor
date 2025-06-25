#!/usr/bin/env node

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./shared/schema.js";
import { eq } from "drizzle-orm";

console.log("🔍 User Information Lookup");
console.log("==========================");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool, { schema });

async function checkUser() {
  try {
    // Test connection
    await pool.query("SELECT NOW()");
    console.log("✅ Connected to database");

    // Get command line arguments
    const username = process.argv[2];
    
    if (!username) {
      console.log("❌ Usage: node check-user.js <username>");
      console.log("Example: node check-user.js test");
      process.exit(1);
    }

    console.log(`🔍 Looking for user: ${username}`);

    // Find the user
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));

    if (!user) {
      console.log(`❌ User '${username}' not found in database`);
      console.log("💡 This user doesn't exist or hasn't been created yet");
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.username}`);
    console.log(`📋 User ID: ${user.id}`);
    console.log(`📧 Email: ${user.email || 'Not provided'}`);
    console.log(`🔑 Role: ${user.role || 'user'}`);
    console.log(`🔐 Auth Type: ${user.authType || 'local'}`);
    console.log(`📅 Created: ${user.createdAt}`);
    console.log(`📅 Updated: ${user.updatedAt}`);
    
    if (user.passwordHash) {
      console.log(`🔒 Password: [HASHED - cannot be retrieved]`);
      console.log(`💡 Login with username: ${user.username}`);
      console.log(`💡 You'll need to know the password you used when creating this account`);
    } else {
      console.log(`🔒 Password: [No password set - this might be a social login account]`);
    }

    if (user.role === 'admin') {
      console.log(`👑 This user has ADMIN privileges`);
      console.log(`🔗 Admin panel available at: /admin`);
    }

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkUser(); 