# Simple Render Fix

The issue is that the build process on Render isn't creating the production file properly. Here's the simplest fix:

## Update Package.json (Required)

**Change this line:**
```json
"start": "NODE_ENV=production node dist/production.js",
```

**To:**
```json
"start": "NODE_ENV=production node dist/index.js",
```

**And change this line:**
```json
"build": "node build.mjs",
```

**Back to:**
```json
"build": "vite build && esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js",
```

## Why This Works

- Render's build system has issues with custom filenames
- Using `dist/index.js` (standard name) works reliably
- The server/production.ts file will still be used as the source
- All your database data and configurations remain intact

After making these package.json changes:
1. Commit and push to git
2. Redeploy on Render
3. Your traders should load properly

This avoids Render's build quirks while maintaining all your fixes.