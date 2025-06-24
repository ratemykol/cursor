# Manual Package.json Update for Render

Since the system prevents package.json editing, you need to manually update it:

## Required Changes

**Find this line in package.json:**
```json
"build": "vite build && esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/production.js",
```

**Replace it with:**
```json
"build": "node build.mjs",
```

## Alternative Solution

If manual editing doesn't work, you can:

1. **Copy build.mjs to your git repository**
2. **Update package.json build command to use build.mjs**
3. **Commit and push changes**
4. **Redeploy on Render**

The build.mjs script ensures dist/production.js is properly created during Render's build process.

## Expected Result

After this change, Render should successfully:
- Run `node build.mjs` during build
- Create `dist/production.js` 
- Start the server with `node dist/production.js`
- Display all 45 traders instead of skeleton placeholders