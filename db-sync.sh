#!/bin/bash
echo "Syncing local database to Render..."
node scripts/sync-db.js
echo "Database sync complete!"