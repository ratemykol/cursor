# Database Synchronization Guide

This guide explains how to keep your local Replit database and Render production database in sync.

## Setup (One-time)

1. **Get your Render database URL**:
   - Go to your Render PostgreSQL dashboard
   - Copy the "External Database URL"

2. **Set up environment variable**:
   ```bash
   node scripts/setup-render-env.js
   ```
   - Enter your Render database URL when prompted
   - This creates `.env.render` file

3. **Load environment variables**:
   ```bash
   export $(cat .env.render | xargs)
   ```

## Daily Workflow Commands

### 📤 Push Local Changes to Render
```bash
npm run db:sync-to-render
```
Use this when you've made changes locally and want to update production.

### 📥 Pull Render Changes to Local
```bash
npm run db:sync-from-render
```
Use this when production has new data you want locally.

### 🔍 Compare Databases
```bash
npm run db:compare
```
Check if databases have the same record counts.

### 💾 Backup Both Databases
```bash
npm run db:backup
```
Creates timestamped backups in `backups/` folder.

### 📊 Export Local Database
```bash
npm run db:export
```
Creates `database_export.sql` file.

## Important Notes

⚠️ **These commands completely replace data** - they don't merge changes.

✅ **Always backup before syncing** using `npm run db:backup`

🔄 **Typical workflow**:
1. `npm run db:compare` - Check differences
2. `npm run db:backup` - Create safety backup  
3. `npm run db:sync-to-render` OR `npm run db:sync-from-render`
4. `npm run db:compare` - Verify sync worked

## File Structure
```
scripts/
├── sync-to-render.js     # Local → Render
├── sync-from-render.js   # Render → Local  
├── compare-databases.js  # Compare counts
├── backup-both.js        # Backup both DBs
└── setup-render-env.js   # One-time setup

backups/                  # Timestamped backups
.env.render              # Render DB URL (created by setup)
```