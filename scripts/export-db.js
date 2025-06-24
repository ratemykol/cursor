#!/usr/bin/env node
import { execSync } from 'child_process';

const LOCAL_DB_URL = process.env.DATABASE_URL;

console.log('Exporting database to database_export.sql...');
execSync(`pg_dump "${LOCAL_DB_URL}" --data-only --inserts > database_export.sql`, { stdio: 'inherit' });

console.log('Database exported successfully!');