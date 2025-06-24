# Upload Clean Code to GitHub (Under 100 Files)

GitHub has a 100-file limit for web uploads. Here's how to upload only the essential files:

## Files to Include (Essential Only):

### Root Files:
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `vite.config.ts`
- `tailwind.config.ts`
- `postcss.config.js`
- `drizzle.config.ts`
- `components.json`
- `Dockerfile`
- `render.yaml`
- `vercel.json`
- `railway.json`
- `RENDER_DEPLOYMENT.md`
- `.gitignore`

### Folders to Include:
- **client/** (entire folder)
- **server/** (entire folder) 
- **shared/** (entire folder)

### Files to EXCLUDE (don't upload):
- `node_modules/` folder
- `dist/` folder
- `.git/` folder
- `uploads/` folder
- `.cache/` folder
- `.config/` folder
- `.local/` folder
- `.upm/` folder
- `attached_assets/` folder

## Steps:

1. **Download your project as ZIP**
2. **Extract the ZIP file**
3. **Delete the excluded folders** listed above
4. **Count remaining files** - should be under 100
5. **Upload to GitHub** using the web interface

## After Upload:

GitHub and Render will automatically run `npm install` to recreate the `node_modules` folder during deployment, so you don't need to include it.

Your essential source code files are what matter for deployment!