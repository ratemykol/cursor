# Render Environment Variables Setup

## Success! Vite Error Fixed ✅

The build completed successfully and the application started. You just need to add environment variables.

## Required Environment Variables

Go to your Render web service dashboard → **Environment** tab and add these:

### 1. SESSION_SECRET (Required)
```
SESSION_SECRET=your-random-secret-string-here
```
**Example**: `SESSION_SECRET=abc123xyz789secretkey456def`

### 2. DATABASE_URL (Required) 
```
DATABASE_URL=your-postgresql-connection-string
```
**Get this from**: Render → Create PostgreSQL database → Connection details

### 3. NODE_ENV (Required)
```
NODE_ENV=production
```

### 4. Optional Security Variables
```
ALLOWED_ORIGINS=https://your-app-name.onrender.com
```

## Quick Setup Steps

1. **In Render Dashboard**:
   - Go to your web service
   - Click **"Environment"** tab
   - Click **"Add Environment Variable"**
   - Add each variable above

2. **Create PostgreSQL Database** (if not done):
   - Render Dashboard → **"New +"** → **"PostgreSQL"**
   - Copy the **Internal Database URL**
   - Use that as your `DATABASE_URL`

3. **Redeploy**:
   - After adding variables, click **"Manual Deploy"**
   - Your app will restart with the environment variables

## Expected Result
Your RateMyKOL application will start successfully and be accessible at your Render URL.

The SESSION_SECRET can be any random string - it's used for securing user sessions.