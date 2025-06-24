#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

console.log('Starting production build...');

// Ensure dist directory exists
if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true });
}

try {
  // Build frontend
  console.log('Building frontend with Vite...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Build backend
  console.log('Building backend with esbuild...');
  execSync('esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/production.js --target=node20', { stdio: 'inherit' });
  
  // Verify files exist
  if (existsSync('dist/production.js')) {
    console.log('✓ Production build completed successfully');
    console.log('✓ dist/production.js created');
  } else {
    throw new Error('Failed to create dist/production.js');
  }
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}