#!/bin/bash
echo "Exporting local database to database_export.sql..."
node scripts/export-db.js
echo "Database export complete!"