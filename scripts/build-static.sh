#!/bin/bash
# Build script that temporarily moves API routes out of the way for static export

set -e

API_DIR="app/api"
API_BACKUP="app/.api-backup"

# Move API routes out of the way
if [ -d "$API_DIR" ]; then
  echo "Temporarily moving API routes for static export..."
  mv "$API_DIR" "$API_BACKUP"
fi

# Run the build
npm run build:next

# Restore API routes
if [ -d "$API_BACKUP" ]; then
  echo "Restoring API routes..."
  mv "$API_BACKUP" "$API_DIR"
fi

echo "Build complete!"
