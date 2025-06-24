#!/bin/bash
# Isolated sync script that doesn't affect your development environment

# Store current DATABASE_URL
ORIGINAL_DB_URL=$DATABASE_URL

# Load Render database URL temporarily
if [ -f .env.render ]; then
    export $(cat .env.render | xargs)
fi

# Check which sync operation to perform
case "$1" in
    "to-render")
        echo "Syncing local database to Render..."
        node scripts/sync-to-render.js
        ;;
    "from-render")
        echo "Syncing Render database to local..."
        node scripts/sync-from-render.js
        ;;
    "compare")
        echo "Comparing databases..."
        node scripts/compare-databases.js
        ;;
    "backup")
        echo "Creating backups..."
        node scripts/backup-both.js
        ;;
    *)
        echo "Usage: ./sync-render.sh [to-render|from-render|compare|backup]"
        exit 1
        ;;
esac

# Restore original DATABASE_URL
export DATABASE_URL=$ORIGINAL_DB_URL
echo "Database environment restored."