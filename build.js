#!/usr/bin/env node
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Building frontend...');
execSync('vite build', { stdio: 'inherit', cwd: __dirname });

console.log('Building backend...');
execSync('esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --outfile=dist/index.js', { stdio: 'inherit', cwd: __dirname });

console.log('Build complete!');