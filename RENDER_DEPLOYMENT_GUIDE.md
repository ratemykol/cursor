# RateMyKOL - Render Deployment Guide

## Prerequisites

1. **GitHub Account**: Your code needs to be in a GitHub repository
2. **Render Account**: Sign up at https://render.com
3. **Database**: PostgreSQL database (will be created automatically)

## Deployment Steps

### Step 1: Prepare Your Repository

1. Make sure all your code is committed to a GitHub repository
2. The `render.yaml` file is already configured in your project root
3. The `build.js` script is ready for production builds

### Step 2: Deploy to Render

1. **Login to Render**: Go to https://render.com and sign in
2. **Connect GitHub**: Link your GitHub account if not already connected
3. **Create New Service**: Click "New" → "Blueprint"
4. **Select Repository**: Choose your RateMyKOL repository
5. **Auto-Deploy**: Render will detect the `render.yaml` file and create:
   - PostgreSQL database (`ratemykol-db`)
   - Web service (`ratemykol-web`)

### Step 3: Configure Environment Variables

The following environment variables are automatically configured:
- `NODE_ENV`: production
- `PORT`: 10000
- `DATABASE_URL`: Connected to the PostgreSQL database

### Step 4: Database Migration

After deployment, run the database migration:
1. Go to your web service dashboard on Render
2. Open the "Shell" tab
3. Run: `npm run db:push`

### Step 5: Verify Deployment

1. Your app will be available at: `https://ratemykol-web.onrender.com`
2. Check the logs for any deployment issues
3. Test the admin login and basic functionality

## Important Notes

- **Cold Starts**: Free tier has cold starts (app sleeps after 15 min of inactivity)
- **Database**: Free PostgreSQL database with 1GB storage limit
- **File Uploads**: Profile images are stored locally (consider cloud storage for production)
- **SSL**: Automatic HTTPS enabled

## Troubleshooting

### Build Failures
- Check the build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### Database Connection Issues
- Confirm DATABASE_URL environment variable is set
- Check if database migration completed successfully
- Review database logs in Render dashboard

### Application Errors
- Check application logs in Render dashboard
- Verify all environment variables are configured
- Test locally with production build: `npm run build && npm start`

## Production Optimizations

For production use, consider:
1. **Upgrade to Paid Plan**: Eliminates cold starts
2. **Cloud Storage**: Use AWS S3 or similar for file uploads
3. **CDN**: Add CloudFlare for better performance
4. **Monitoring**: Set up application monitoring
5. **Backup**: Regular database backups

## Support

If you encounter issues:
1. Check Render documentation: https://render.com/docs
2. Review application logs for specific error messages
3. Test the build process locally first