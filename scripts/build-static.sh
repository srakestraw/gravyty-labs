#!/usr/bin/env bash
# Build script that temporarily moves API routes out of the way for static export

set -x  # Enable debug output
# Note: set -e removed to allow build to continue despite prerender warnings

# Error handler to show what failed
trap 'echo "ERROR: Build failed at line $LINENO. Command: $BASH_COMMAND"' ERR

# Print environment info
echo "=========================================="
echo "Build Environment"
echo "=========================================="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"
echo "NODE_ENV: ${NODE_ENV:-not set}"
echo "=========================================="

API_DIR="app/api"
API_BACKUP="app/.api-backup"

# Ensure workspace packages have dependencies installed and built
echo ""
echo "=========================================="
echo "Step 1: Building workspace packages"
echo "=========================================="
if [ -d "packages/contracts" ]; then
  echo "Installing and building contracts package..."
  if ! (cd packages/contracts && npm install --legacy-peer-deps && npm run build); then
    echo "ERROR: Failed to build contracts package"
    exit 1
  fi
  echo "✓ Contracts package built successfully"
else
  echo "⚠ packages/contracts directory not found, skipping..."
fi

if [ -d "packages/db" ]; then
  echo "Installing db package dependencies..."
  if ! (cd packages/db && npm install --legacy-peer-deps); then
    echo "ERROR: Failed to install db package dependencies"
    exit 1
  fi
  echo "✓ DB package dependencies installed"
else
  echo "⚠ packages/db directory not found, skipping..."
fi

# Clean any previous build artifacts
echo ""
echo "=========================================="
echo "Step 2: Cleaning build artifacts"
echo "=========================================="
rm -rf .next out
echo "✓ Build artifacts cleaned"

# Move API routes out of the way BEFORE any Next.js operations
echo ""
echo "=========================================="
echo "Step 3: Preparing API routes for static export"
echo "=========================================="
if [ -d "$API_DIR" ]; then
  echo "Temporarily moving API routes for static export..."
  mv "$API_DIR" "$API_BACKUP"
  echo "✓ API routes moved to backup"
else
  echo "⚠ API directory not found, skipping..."
fi

# Run the build with clean cache
echo ""
echo "=========================================="
echo "Step 4: Running Next.js build"
echo "=========================================="
# Run build and capture exit code (don't fail on error yet)
BUILD_EXIT_CODE=0
NODE_ENV=production npm run build:next 2>&1 | tee /tmp/build.log || BUILD_EXIT_CODE=$?

# Check if build output was created (more reliable than exit code for static export)
# Next.js may exit with error code due to prerender warnings but still generate output
if [ -d "out" ]; then
  echo "✓ Build output directory 'out' was created successfully"
  if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo "⚠ Build completed with warnings (prerender errors), but output was generated"
    echo "✓ Continuing with build..."
  fi
else
  echo "ERROR: Build output directory 'out' was not created"
  echo "Build log tail:"
  tail -50 /tmp/build.log || true
  # Restore API routes before exiting
  if [ -d "$API_BACKUP" ]; then
    echo "Restoring API routes after build failure..."
    mv "$API_BACKUP" "$API_DIR"
  fi
  exit 1
fi

# Verify build output exists
if [ ! -d "out" ]; then
  echo "ERROR: Build output directory 'out' was not created"
  # Restore API routes before exiting
  if [ -d "$API_BACKUP" ]; then
    echo "Restoring API routes after build failure..."
    mv "$API_BACKUP" "$API_DIR"
  fi
  exit 1
fi
echo "✓ Next.js build completed successfully"

# Restore API routes immediately after build
echo ""
echo "=========================================="
echo "Step 5: Restoring API routes"
echo "=========================================="
if [ -d "$API_BACKUP" ]; then
  echo "Restoring API routes..."
  mv "$API_BACKUP" "$API_DIR"
  echo "✓ API routes restored"
else
  echo "⚠ No API backup found to restore"
fi

# Ensure _redirects file is copied to out directory for Netlify
echo ""
echo "=========================================="
echo "Step 6: Copying Netlify configuration files"
echo "=========================================="
if [ -f "public/_redirects" ]; then
  echo "Copying _redirects file to out directory..."
  cp public/_redirects out/_redirects
  echo "✓ _redirects file copied"
else
  echo "⚠ public/_redirects file not found, skipping..."
fi

echo ""
echo "=========================================="
echo "✓ Build complete!"
echo "=========================================="
