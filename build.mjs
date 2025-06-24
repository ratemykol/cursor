import { build } from 'esbuild';
import { execSync } from 'child_process';

async function buildProject() {
  // First build the frontend with Vite
  console.log('Building frontend with Vite...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Then build the backend with esbuild, excluding vite
  console.log('Building backend with esbuild...');
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outdir: 'dist',
    external: [
      'vite',
      '@vitejs/plugin-react',
      './vite',
      './vite.js'
    ],
    packages: 'external'
  });
  
  console.log('Build completed successfully!');
}

buildProject().catch(console.error);