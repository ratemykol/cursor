# RateMyKOL Render Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Changes Made
- [x] Updated CORS configuration to handle multiple origins
- [x] Fixed static file serving path for production
- [x] Updated build script to use correct server file
- [x] Added health check endpoint (`/health`)
- [x] Created database setup script
- [x] Updated render.yaml configuration
- [x] Added comprehensive deployment guide

### ✅ Files Modified
- [x] `server/index.ts` - CORS configuration
- [x] `server/static.ts` - Static file serving
- [x] `server/routes.ts` - Health check endpoint
- [x] `build.js` - Build script
- [x] `render.yaml` - Render configuration
- [x] `package.json` - Added db:setup script
- [x] `setup-db.js` - Database initialization script
- [x] `RENDER_DEPLOYMENT_GUIDE.md` - Deployment instructions

## Deployment Steps

### 1. Push Code to Repository
```bash
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

### 2. Create Render Account
- Go to [render.com](https://render.com)
- Sign up for free account

### 3. Create PostgreSQL Database
- Click "New +" → "PostgreSQL"
- Name: `ratemykol-db`
- Plan: Starter (free)
- Region: Choose closest to users
- Click "Create Database"

### 4. Create Web Service
- Click "New +" → "Web Service"
- Connect your Git repository
- Configure:
  - Name: `ratemykol-web`
  - Environment: Node
  - Region: Same as database
  - Branch: `main`
  - Build Command: `npm ci && npm run build`
  - Start Command: `npm start`
  - Plan: Starter

### 5. Set Environment Variables
- `NODE_ENV`: `production`
- `PORT`: `10000`
- `DATABASE_URL`: Link to your PostgreSQL database
- `SESSION_SECRET`: (Render auto-generates)
- `FRONTEND_URL`: `https://your-app-name.onrender.com`

### 6. Deploy
- Click "Create Web Service"
- Wait for build to complete (5-10 minutes)

### 7. Verify Deployment
- Check deployment logs for errors
- Visit your app URL
- Test sign-in functionality
- Check health endpoint: `https://your-app.onrender.com/health`

## Post-Deployment

### Database Setup (if needed)
If tables aren't created automatically:
1. Go to your web service dashboard
2. Click "Shell"
3. Run: `npm run db:setup`

### Testing Checklist
- [ ] Homepage loads correctly
- [ ] Sign-in works
- [ ] Sign-up works
- [ ] Trader search works
- [ ] Rating system works
- [ ] File uploads work
- [ ] Admin features work (if applicable)

## Troubleshooting

### Common Issues
1. **Build Fails**: Check package.json dependencies
2. **Database Connection**: Verify DATABASE_URL format
3. **CORS Errors**: Check FRONTEND_URL setting
4. **Static Files**: Ensure build creates dist/public directory

### Useful Commands
```bash
# Check build locally
npm run build

# Test locally
npm run dev

# Check database connection
npm run db:setup
```

## Monitoring

### Health Check
- Endpoint: `/health`
- Expected response: `{"status":"healthy","timestamp":"...","environment":"production"}`

### Logs
- Check Render dashboard for application logs
- Monitor for errors in deployment logs

## Security Notes
- ✅ Helmet.js security headers enabled
- ✅ Rate limiting configured
- ✅ CORS properly configured
- ✅ Sessions stored in PostgreSQL
- ✅ Environment variables secured

## Performance
- ✅ Static files served efficiently
- ✅ Database connection pooling
- ✅ Rate limiting prevents abuse
- ✅ Optimized for Render infrastructure

## Support
If issues persist:
1. Check Render documentation
2. Review deployment logs
3. Test locally first
4. Verify all environment variables 