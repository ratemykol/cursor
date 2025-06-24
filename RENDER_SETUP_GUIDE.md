# Complete Render Deployment Setup Guide

## Step 1: Create Web Service (if not done)

1. Go to **render.com** and sign in
2. Click **"New +"** button
3. Select **"Web Service"**
4. Choose **"Build and deploy from a Git repository"**
5. Connect your GitHub account and select your repository

## Step 2: Configure Service Settings

During setup OR in service settings, configure:

### Basic Settings
- **Name**: `ratemykol` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your deployment branch)
- **Root Directory**: Leave blank (uses repository root)

### Build & Deploy Settings
- **Runtime**: `Node`
- **Build Command**: 
```
npm install && npm run build && esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/production.js
```
- **Start Command**:
```
NODE_ENV=production node dist/production.js
```

### Plan
- **Instance Type**: Free tier (or paid for production)
- **Auto-Deploy**: Yes (deploys on git push)

## Step 3: Environment Variables

Add these environment variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://ratemykol_user:NcQtmKQ5H37tTGpIqnJy7cwBnj0sYDy3@dpg-d1cupeili9vc739j3a6g-a.oregon-postgres.render.com/ratemykol_u8bw` |
| `NODE_ENV` | `production` |

**Note**: Use the INTERNAL database URL, not external.

## Step 4: Deploy

1. Click **"Create Web Service"** (if setting up new)
2. OR click **"Manual Deploy"** (if updating existing)
3. Monitor the build logs for any errors

## If You Can't Find Settings

### Option A: During Initial Setup
The build/start commands appear during the "Create Web Service" flow.

### Option B: Existing Service
1. Click on your service name in dashboard
2. Look for these sections:
   - **"Settings"** tab
   - **"Environment"** tab  
   - **"Builds"** or **"Build & Deploy"** section

### Option C: Service Overview
Sometimes settings are on the main service page under:
- **"Build Command"** field
- **"Start Command"** field
- **"Environment Variables"** section

## Troubleshooting

### If build fails:
- Check that `esbuild` is in your dependencies
- Verify the build command is exactly as shown above

### If start fails:
- Ensure start command points to `dist/production.js`
- Check environment variables are set correctly
- Verify DATABASE_URL uses internal Render connection

### Common Locations for Settings:
- Main service dashboard
- Settings → Build & Deploy
- Settings → Environment  
- Service Overview page

## Files Ready for Deployment
- ✅ `dist/production.js` (58.5KB production server)
- ✅ `dist/public/` (Frontend assets)
- ✅ Database with 45 traders + admin user

## Expected Result
After successful deployment, your app will be available at:
`https://your-service-name.onrender.com`