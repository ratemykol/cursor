#!/usr/bin/env node
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Setting up Render database environment variable\n');

rl.question('Enter your Render database URL: ', (renderUrl) => {
  if (!renderUrl.trim()) {
    console.log('❌ No URL provided. Exiting...');
    rl.close();
    return;
  }

  // Create or update .env file for local development
  const envContent = `RENDER_DATABASE_URL=${renderUrl.trim()}\n`;
  
  try {
    fs.writeFileSync('.env.render', envContent);
    console.log('\n✅ Render database URL saved to .env.render');
    console.log('\n📋 Next steps:');
    console.log('1. Run: export $(cat .env.render | xargs)');
    console.log('2. Then use any of the sync commands:');
    console.log('   - npm run db:sync-to-render    (local → render)');
    console.log('   - npm run db:sync-from-render  (render → local)');
    console.log('   - npm run db:compare           (check differences)');
    console.log('   - npm run db:backup            (backup both)');
  } catch (error) {
    console.log('❌ Error saving file:', error.message);
  }
  
  rl.close();
});