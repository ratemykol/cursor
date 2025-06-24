# Render Environment Setup Guide

## Required Environment Variables

Set these in your Render service's Environment tab:

### Database Configuration
```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```
**Important:** Replace with your actual Render PostgreSQL connection string

### Session Security
```
SESSION_SECRET=your-secure-random-string-here
```
**Important:** Generate a secure random string for production

### Node Environment
```
NODE_ENV=production
```

## Common Issues & Solutions

### ECONNREFUSED Error
- **Cause:** DATABASE_URL not set or incorrect
- **Solution:** Verify DATABASE_URL matches your Render PostgreSQL service exactly

### SSL Connection Issues
- **Cause:** Missing SSL configuration
- **Solution:** Ensure `?sslmode=require` is at the end of DATABASE_URL

### Session Store Errors
- **Cause:** Database connection issues or missing sessions table
- **Solution:** The app automatically creates the sessions table on first run

## Verification Steps

1. Check Render logs for database connection success
2. Verify traders API returns data: `GET /api/traders`
3. Test authentication: `GET /api/auth/me`

## Database Setup Commands

If you need to populate the database:
```bash
# Export local database
./db-export.sh

# Set Render database URL
export RENDER_DATABASE_URL="your_render_db_url"

# Sync to Render
./db-sync.sh
```