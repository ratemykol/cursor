#!/usr/bin/env node

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./shared/schema.js";
import { eq } from "drizzle-orm";

console.log("🔧 Admin User Creation Script");
console.log("==============================");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool, { schema });

async function createAdmin() {
  try {
    // Test connection
    await pool.query("SELECT NOW()");
    console.log("✅ Connected to database");

    // Get command line arguments
    const username = process.argv[2];
    
    if (!username) {
      console.log("❌ Usage: node create-admin.js <username>");
      console.log("Example: node create-admin.js admin");
      process.exit(1);
    }

    console.log(`🔍 Looking for user: ${username}`);

    // Find the user
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));

    if (!user) {
      console.log(`❌ User '${username}' not found`);
      console.log("💡 First create a user account by signing up on the website");
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.username} (ID: ${user.id})`);
    console.log(`📋 Current role: ${user.role || 'user'}`);

    if (user.role === 'admin') {
      console.log("ℹ️  User is already an admin!");
      process.exit(0);
    }

    // Update user to admin
    const [updatedUser] = await db
      .update(schema.users)
      .set({ 
        role: 'admin',
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, user.id))
      .returning();

    console.log(`🎉 Successfully made '${username}' an admin!`);
    console.log(`📋 New role: ${updatedUser.role}`);
    console.log(`🔑 You can now log in with username: ${username}`);
    console.log(`🔗 Admin panel will be available at: /admin`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdmin(); 