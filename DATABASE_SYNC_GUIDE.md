# Database Sync Between Local and Render

## Setup

1. **Add Render database URL to your environment:**
```bash
export RENDER_DATABASE_URL="your_render_database_connection_string"
```

2. **Make scripts executable:**
```bash
chmod +x scripts/*.js
```

## Available Commands

### Export Local Database
```bash
npm run db:export
```
Updates `database_export.sql` with current local data.

### Sync to Render
```bash
npm run db:sync
```
Copies all local database data to Render (replaces existing data).

### Push Schema Only
```bash
npm run db:push
```
Updates database structure without data changes.

## Workflow

### When you make data changes locally:
1. `npm run db:export` - Save current state
2. `npm run db:sync` - Upload to Render
3. Commit `database_export.sql` to git

### When deploying:
- Schema changes happen automatically via `npm run db:push`
- Data sync happens when you run `npm run db:sync`

## Environment Variables Needed

**Local Development:**
- `DATABASE_URL` - Your local/Replit database
- `RENDER_DATABASE_URL` - Your Render database connection string

**Render Production:**
- `DATABASE_URL` - Automatically provided by Render

This setup allows you to make changes locally and easily sync them to production while maintaining proper version control of your database state.