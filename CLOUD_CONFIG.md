# Cloud Deployment Configuration

## Render (Primary Platform)

### Automatic Setup via Blueprint
```yaml
# render.yaml (already configured)
services:
  - type: web
    name: ratemykol-web
    env: node
    plan: starter
    buildCommand: npm ci && node build.js
    startCommand: npm start

databases:
  - name: ratemykol-db
    plan: free
```

### Manual Configuration
If Blueprint deployment fails, use these settings:

**Database Settings:**
- Type: PostgreSQL
- Plan: Free
- Database Name: ratemykol
- User: ratemykol_user

**Web Service Settings:**
- Build Command: `npm ci && node build.js`
- Start Command: `npm start`
- Environment Variables:
  - NODE_ENV: production
  - DATABASE_URL: (auto-connected from database)
  - PORT: (auto-set by Render)

## Alternative Platforms

### Vercel + Neon
1. **Database:** Create PostgreSQL on neon.tech
2. **Frontend:** Deploy to Vercel
3. **Backend:** Use Vercel Functions or separate service

### Railway
1. Upload repository to Railway
2. Add PostgreSQL service
3. Connect services automatically

### DigitalOcean App Platform
1. Create new app from GitHub
2. Add managed database
3. Configure environment variables

## Environment Variables (All Platforms)
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: production
- `PORT`: Set by platform (usually auto-configured)

## Build Requirements
- Node.js 18+
- PostgreSQL database
- File upload directory (./uploads)
- Static file serving (./dist/public)

## Security Features Included
- Helmet.js for security headers
- CORS protection
- Rate limiting
- Secure session management
- Input validation
- File upload restrictions

Your platform is configured for immediate deployment on any Node.js hosting provider.