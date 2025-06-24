# Render Deployment Guide

## Current Issue Analysis
Your deployment is failing because of configuration mismatches between build output and start command.

## Required Render Configuration

### Service Settings
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment**: Node
- **Auto-Deploy**: Yes (recommended)

### Environment Variables (Critical)
```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
SESSION_SECRET=your-secure-random-string
NODE_ENV=production
```

### Port Configuration
- **Render automatically sets PORT environment variable**
- **Your app listens on process.env.PORT (usually 10000)**
- **Render handles external routing to your internal port**

## Package.json Fix Required
You MUST update these two lines in package.json:

**Current (BROKEN):**
```json
"build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
"start": "NODE_ENV=production node dist/index.js",
```

**Fixed (CORRECT):**
```json
"build": "vite build && esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/production.js",
"start": "NODE_ENV=production node dist/production.js",
```

## Deployment Process
1. Edit package.json with the correct build/start commands
2. Commit and push changes to git
3. In Render dashboard: "Manual Deploy" → "Deploy latest commit"
4. Watch logs for successful startup messages

## Expected Success Logs
```
Database URL configured: postgresql://username:***@host...
Environment check: { NODE_ENV: 'production', PORT: '10000', SESSION_SECRET: 'SET' }
Starting server on port: 10000
✓ Server successfully started on port 10000
✓ Server listening on 0.0.0.0:10000
```

## Testing After Deploy
- Your site URL should load the homepage
- API test: `https://your-app.onrender.com/api/traders` should return JSON
- Traders should display instead of skeleton placeholders