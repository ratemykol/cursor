#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';

const RENDER_DB_URL = process.env.RENDER_DATABASE_URL;
const LOCAL_DB_URL = process.env.DATABASE_URL;

if (!RENDER_DB_URL) {
  console.error('RENDER_DATABASE_URL environment variable not set');
  process.exit(1);
}

console.log('Exporting local database...');
execSync(`pg_dump "${LOCAL_DB_URL}" --data-only --inserts > temp_export.sql`, { stdio: 'inherit' });

console.log('Clearing Render database...');
execSync(`psql "${RENDER_DB_URL}" -c "TRUNCATE TABLE review_votes, user_badges, trader_badges, ratings, traders, users RESTART IDENTITY CASCADE"`, { stdio: 'inherit' });

console.log('Importing to Render database...');
execSync(`psql "${RENDER_DB_URL}" < temp_export.sql`, { stdio: 'inherit' });

console.log('Cleaning up...');
fs.unlinkSync('temp_export.sql');

console.log('Database sync complete!');