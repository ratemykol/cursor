#!/usr/bin/env node
import { execSync } from 'child_process';

const RENDER_DB_URL = process.env.RENDER_DATABASE_URL;
const LOCAL_DB_URL = process.env.DATABASE_URL;

if (!RENDER_DB_URL) {
  console.error('RENDER_DATABASE_URL environment variable not set');
  process.exit(1);
}

console.log('Comparing database counts...\n');

const tables = ['users', 'traders', 'ratings', 'review_votes', 'user_badges', 'trader_badges'];

for (const table of tables) {
  try {
    const localCount = execSync(`psql "${LOCAL_DB_URL}" -t -c "SELECT COUNT(*) FROM ${table}"`, { encoding: 'utf8' }).trim();
    const renderCount = execSync(`psql "${RENDER_DB_URL}" -t -c "SELECT COUNT(*) FROM ${table}"`, { encoding: 'utf8' }).trim();
    
    const status = localCount === renderCount ? '✓' : '✗';
    console.log(`${table.padEnd(15)} | Local: ${localCount.padStart(4)} | Render: ${renderCount.padStart(4)} | ${status}`);
  } catch (error) {
    console.log(`${table.padEnd(15)} | Error checking counts`);
  }
}

console.log('\n✓ = Counts match | ✗ = Counts differ');