#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';

const RENDER_DB_URL = process.env.RENDER_DATABASE_URL;
const LOCAL_DB_URL = process.env.DATABASE_URL;

if (!RENDER_DB_URL) {
  console.error('RENDER_DATABASE_URL environment variable not set');
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

console.log('Creating backup of local database...');
execSync(`pg_dump "${LOCAL_DB_URL}" --data-only --inserts > backups/local_${timestamp}.sql`, { stdio: 'inherit' });

console.log('Creating backup of Render database...');
execSync(`pg_dump "${RENDER_DB_URL}" --data-only --inserts > backups/render_${timestamp}.sql`, { stdio: 'inherit' });

console.log(`Backups created successfully:
- Local: backups/local_${timestamp}.sql
- Render: backups/render_${timestamp}.sql`);