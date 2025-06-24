# RateMyKOL - Render Deployment Guide

## Prerequisites

1. **Render Account**: Create a free account at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Database**: You'll need a PostgreSQL database (Render provides free PostgreSQL)

## Step-by-Step Deployment

### 1. Database Setup

1. In your Render dashboard, click "New +" and select "PostgreSQL"
2. Configure the database:
   - **Name**: `ratemykol-db`
   - **Database**: `ratemykol`
   - **User**: `ratemykol_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free tier is sufficient for testing
3. Click "Create Database"
4. Wait for the database to be created and note the connection details

### 2. Web Service Setup

1. In your Render dashboard, click "New +" and select "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `ratemykol-web`
   - **Environment**: `Node`
   - **Region**: Same as your database
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `npm ci && node build.js`
   - **Start Command**: `cd dist && npm install --only=prod && npm start`

### 3. Environment Variables

Add these environment variables in the Render dashboard:

**Required Variables:**
- `NODE_ENV`: `production`
- `PORT`: `10000`
- `DATABASE_URL`: Link to your PostgreSQL database (use the connection string from step 1)
- `SESSION_SECRET`: Generate a random secure string (32+ characters)

**Optional Variables:**
- `ALLOWED_ORIGINS`: Your domain(s) for CORS (comma-separated)

### 4. Database Schema Setup

After deployment, you need to set up your database schema:

1. In your Render web service dashboard, go to "Shell"
2. Run the database migration command:
   ```bash
   npm run db:push
   ```

### 5. Health Check

The service includes a health check endpoint at `/` that Render will use to monitor your application.

## Configuration Files

Your project includes these deployment files:

- `render.yaml`: Infrastructure as Code configuration
- `build.js`: Custom build script for production
- `server/production.ts`: Production server configuration

## Security Features

The production server includes:
- Helmet.js for security headers
- Rate limiting
- CORS protection
- Secure session configuration
- Input validation

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **Database Connection Issues**
   - Ensure `DATABASE_URL` is correctly set
   - Check database is running and accessible

3. **Session Issues**
   - Verify `SESSION_SECRET` is set
   - Check database has sessions table

4. **Static File Issues**
   - Ensure frontend build completed successfully
   - Check file paths in production server

### Debug Steps:

1. Check Render logs in the dashboard
2. Use the Shell feature to debug the container
3. Verify environment variables are set correctly
4. Test database connectivity

## Scaling

To scale your application:
1. Upgrade your Render plan for more resources
2. Consider separating frontend and backend services
3. Add Redis for session storage at scale
4. Implement database connection pooling

## Domain Setup

To use a custom domain:
1. Add your domain in Render dashboard
2. Configure DNS settings as instructed
3. SSL certificates are automatically provisioned

## Monitoring

Render provides:
- Application logs
- Performance metrics
- Uptime monitoring
- Error tracking

Access these through your service dashboard.