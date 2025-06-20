# Deploy RateMyKOL to Render - Complete Guide

## Step 1: Prepare Your GitHub Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

## Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up using your GitHub account
3. Connect your GitHub repository

## Step 3: Create PostgreSQL Database

1. In Render dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. Configure:
   - **Name**: `ratemykol-db`
   - **Database**: `ratemykol`
   - **User**: `ratemykol_user`
   - **Region**: Choose closest to your users
   - **Plan**: **Starter ($7/month)**
4. Click **"Create Database"**
5. **Copy the External Database URL** - you'll need this for the web service

## Step 4: Create Web Service

1. Click **"New +"** again
2. Select **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ratemykol`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **Starter ($7/month)**

## Step 5: Configure Environment Variables

In the web service settings, add these environment variables:

1. **NODE_ENV**: `production`
2. **DATABASE_URL**: Paste the External Database URL from Step 3
3. **PORT**: `10000` (Render's default)

## Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build your application
   - Start the server

## Step 7: Run Database Migration

After deployment succeeds:

1. Go to your web service dashboard
2. Click **"Shell"** tab
3. Run: `npm run db:push`
4. This creates all your database tables

## Step 8: Test Your Application

Your app will be available at: `https://ratemykol.onrender.com`

Test these features:
- Homepage loads correctly
- User registration works
- User login/logout functions
- Trader profiles display
- Rating system works
- Bio persistence after logout/login

## Cost Breakdown

- **Web Service**: $7/month (Starter plan)
- **PostgreSQL**: $7/month (Starter plan)
- **Total**: $14/month

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure `package.json` has correct scripts

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check database is running in Render dashboard

### App Not Loading
- Check web service logs
- Verify PORT environment variable is set

### Static Files Not Serving
- Ensure build command completed successfully
- Check `dist/public` folder exists after build

## Your Files Ready for Render

✓ `render.yaml` - Infrastructure as code
✓ Updated `server/index.ts` - Dynamic port configuration
✓ `package.json` - Build and start scripts
✓ Production security settings enabled

## Support

If you need help:
1. Check Render documentation: [render.com/docs](https://render.com/docs)
2. View service logs in Render dashboard
3. Use Render community forum for support

Your RateMyKOL application is now production-ready and will be accessible worldwide!