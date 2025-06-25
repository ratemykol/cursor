#!/usr/bin/env node

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./shared/schema.js";
import { eq } from "drizzle-orm";

console.log("🗑️  User Deletion Script");
console.log("========================");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool, { schema });

async function deleteUser() {
  try {
    // Test connection
    await pool.query("SELECT NOW()");
    console.log("✅ Connected to database");

    // Get command line arguments
    const username = process.argv[2];
    
    if (!username) {
      console.log("❌ Usage: node delete-user.js <username>");
      console.log("Example: node delete-user.js test");
      process.exit(1);
    }

    console.log(`🔍 Looking for user: ${username}`);

    // Find the user first
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));

    if (!user) {
      console.log(`❌ User '${username}' not found in database`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.username}`);
    console.log(`📋 User ID: ${user.id}`);
    console.log(`📧 Email: ${user.email || 'Not provided'}`);
    console.log(`🔑 Role: ${user.role || 'user'}`);
    console.log(`📅 Created: ${user.createdAt}`);

    // Ask for confirmation
    console.log(`\n⚠️  WARNING: This will permanently delete user '${username}' and all their data!`);
    console.log(`📊 This includes:`);
    console.log(`   - User profile`);
    console.log(`   - All ratings/reviews they made`);
    console.log(`   - All votes they cast`);
    console.log(`   - All badges they earned`);
    
    // For safety, we'll require a confirmation flag
    const confirm = process.argv[3];
    if (confirm !== '--confirm') {
      console.log(`\n💡 To confirm deletion, run:`);
      console.log(`   node delete-user.js ${username} --confirm`);
      process.exit(1);
    }

    console.log(`\n🗑️  Deleting user '${username}'...`);

    // Delete related data first (foreign key constraints)
    console.log(`   🗑️  Deleting user's ratings...`);
    await db.delete(schema.ratings).where(eq(schema.ratings.userId, user.id));
    
    console.log(`   🗑️  Deleting user's review votes...`);
    await db.delete(schema.reviewVotes).where(eq(schema.reviewVotes.userId, user.id));
    
    console.log(`   🗑️  Deleting user's badges...`);
    await db.delete(schema.userBadges).where(eq(schema.userBadges.userId, user.id));
    
    console.log(`   🗑️  Deleting user profile...`);
    await db.delete(schema.users).where(eq(schema.users.id, user.id));

    console.log(`✅ Successfully deleted user '${username}' and all associated data!`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

deleteUser(); 