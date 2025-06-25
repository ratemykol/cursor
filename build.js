#!/usr/bin/env node

import { build } from 'vite';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

console.log('🚀 BUILD TIMESTAMP:', new Date().toISOString());
console.log('🔧 FORCING NEW DEPLOYMENT - AUTH FIX v2');

console.log('Building client...');
await build();

console.log('Building server...');
execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

console.log('Creating package.json for production...');
const prodPackage = {
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "NODE_ENV=production node index.js"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "@tanstack/react-query": "^5.60.5",
    "bcryptjs": "^3.0.2",
    "connect-pg-simple": "^10.0.0",
    "cors": "^2.8.5",
    "drizzle-orm": "^0.39.1",
    "drizzle-zod": "^0.7.0",
    "express": "^4.21.2",
    "express-rate-limit": "^7.5.0",
    "express-session": "^1.18.1",
    "express-validator": "^7.2.1",
    "helmet": "^8.1.0",
    "multer": "^2.0.1",
    "pg": "^8.16.2",
    "zod": "^3.24.2",
    "zod-validation-error": "^3.4.0"
  }
};

writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));

console.log('✅ Build complete with AUTH FIX v2!');