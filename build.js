#!/usr/bin/env node
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('Building frontend...');
  execSync('npx vite build', { stdio: 'inherit', cwd: __dirname });

  console.log('Building backend...');
  const serverFile = join(__dirname, 'server/production.ts');
  if (!existsSync(serverFile)) {
    throw new Error('server/production.ts not found');
  }
  
  execSync('npx esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --outfile=dist/index.js', { stdio: 'inherit', cwd: __dirname });

  console.log('Build complete!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}