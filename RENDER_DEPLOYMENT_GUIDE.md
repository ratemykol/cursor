# Render Deployment Guide for RateMyKOL

This guide will help you deploy the RateMyKOL application to Render without issues.

## Prerequisites

1. A Render account (free tier available)
2. Your code pushed to a Git repository (GitHub, GitLab, etc.)

## Step 1: Connect Your Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" and select "Web Service"
3. Connect your Git repository
4. Select the repository containing your RateMyKOL code

## Step 2: Configure the Web Service

Use these settings:

- **Name**: `ratemykol-web` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Starter` (free tier)

## Step 3: Environment Variables

Add these environment variables in the Render dashboard:

- `NODE_ENV`: `production`
- `PORT`: `10000`
- `SESSION_SECRET`: (Render will auto-generate this)
- `FRONTEND_URL`: `https://your-app-name.onrender.com` (replace with your actual URL)

## Step 4: Create Database

1. In Render dashboard, click "New +" and select "PostgreSQL"
2. Name it `ratemykol-db`
3. Choose `Starter` plan
4. Note the connection string

## Step 5: Link Database to Web Service

1. Go back to your web service
2. Add environment variable:
   - Key: `DATABASE_URL`
   - Value: Select from database (choose the connection string)

## Step 6: Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Wait for the build to complete (usually 5-10 minutes)

## Step 7: Verify Deployment

1. Check the deployment logs for any errors
2. Visit your app URL to ensure it's working
3. Test the sign-in functionality

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are in `package.json`
2. **Database Connection**: Ensure `DATABASE_URL` is set correctly
3. **CORS Issues**: The app is configured to handle multiple origins
4. **Static Files**: Ensure the build process creates files in `dist/public`

### Logs

- Check Render logs for detailed error information
- The app includes comprehensive logging for debugging

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode | Yes |
| `PORT` | Server port | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Session encryption key | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | No |

## Security Notes

- The app uses Helmet for security headers
- Rate limiting is enabled
- CORS is configured for production
- Sessions are stored in PostgreSQL
- All sensitive data is encrypted

## Performance

- The app is optimized for Render's infrastructure
- Static files are served efficiently
- Database connections are pooled
- Rate limiting prevents abuse

## Support

If you encounter issues:
1. Check the deployment logs
2. Verify environment variables
3. Ensure database is properly configured
4. Test locally first with `npm run dev`