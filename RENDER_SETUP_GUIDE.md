# Render Setup - Port Issue Fix

## CRITICAL: Remove Manual PORT Setting

If you manually set `PORT = ______` in your Render environment variables, **DELETE IT IMMEDIATELY**.

### Why This Breaks Deployment
- Render automatically assigns a dynamic port (usually 10000)
- When you manually set PORT, it conflicts with Render's internal routing
- This causes the 404 "Not Found" errors you're seeing

## Correct Environment Variables

**REMOVE:**
```
PORT=5000  ← DELETE THIS
```

**KEEP ONLY:**
```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
SESSION_SECRET=your-secure-random-string
NODE_ENV=production
```

## Fix Steps

1. **Go to Render Dashboard** → Your Web Service → Environment tab
2. **Find the PORT variable** and **click DELETE**
3. **Save changes**
4. **Redeploy:** Manual Deploy → Deploy latest commit

## What Should Happen
- Render automatically sets PORT to its assigned value
- Your app reads `process.env.PORT` (no manual override)
- Server starts on correct port and responds to requests
- Traders load properly instead of skeleton placeholders

## Expected Logs After Fix
```
Environment PORT variable: 10000
Starting server on port: 10000
✓ Server successfully started on port 10000
```

This should immediately fix your 404 errors once you remove the manual PORT setting.