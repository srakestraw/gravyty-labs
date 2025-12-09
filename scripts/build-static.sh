#!/usr/bin/env bash
# Build script that temporarily moves API routes out of the way for static export

set -e

API_DIR="app/api"
API_BACKUP="app/.api-backup"

# Ensure workspace packages have dependencies installed
echo "Installing workspace package dependencies..."
if [ -d "packages/contracts" ]; then
  cd packages/contracts && npm install --legacy-peer-deps && cd ../..
fi
if [ -d "packages/db" ]; then
  cd packages/db && npm install --legacy-peer-deps && cd ../..
fi

# Clean any previous build artifacts
echo "Cleaning build artifacts..."
rm -rf .next out

# Move API routes out of the way BEFORE any Next.js operations
if [ -d "$API_DIR" ]; then
  echo "Temporarily moving API routes for static export..."
  mv "$API_DIR" "$API_BACKUP"
fi

# Run the build with clean cache
echo "Running Next.js build..."
NODE_ENV=production npm run build:next

# Restore API routes immediately after build
if [ -d "$API_BACKUP" ]; then
  echo "Restoring API routes..."
  mv "$API_BACKUP" "$API_DIR"
fi

# Ensure _redirects file is copied to out directory for Netlify
if [ -f "public/_redirects" ]; then
  echo "Copying _redirects file to out directory..."
  cp public/_redirects out/_redirects
fi

echo "Build complete!"
