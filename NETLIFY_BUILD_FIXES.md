# Netlify Build Failure - Options & Solutions

## Common Causes & Solutions

### Option 1: Fix Build Script & Add Prerequisites (Recommended)

**Issues:**
- Bash script may not be executable
- Prisma client not generated before build
- Workspace packages may need building

**Solution:** Update `netlify.toml`:

```toml
[build]
  publish = "out"
  command = "npm install && npm run build:static"

[build.environment]
  NODE_VERSION = "20"  # Update to Node 20 (Next.js 14 works better with 20)
  NPM_FLAGS = "--legacy-peer-deps"  # If you have peer dependency issues

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Update `scripts/build-static.sh`** to include prerequisites:

```bash
#!/bin/bash
set -e

# Install dependencies for workspace packages
echo "Installing workspace dependencies..."
cd packages/contracts && npm install && cd ../..
cd packages/db && npm install && cd ../..

# Generate Prisma client (if needed, though it should be in node_modules)
echo "Generating Prisma client..."
cd packages/db && npm run db:generate && cd ../..

# Build workspace packages
echo "Building workspace packages..."
cd packages/contracts && npm run build && cd ../..

API_DIR="app/api"
API_BACKUP="app/.api-backup"

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

echo "Build complete!"
```

---

### Option 2: Use Netlify's Next.js Plugin (Simpler)

**If you're using static export, you might not need the plugin, but it can help with dependencies:**

Update `netlify.toml`:

```toml
[build]
  publish = "out"
  command = "npm install && npm run build:static"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[plugins.inputs]
  skipBuildDependencies = false
```

---

### Option 3: Simplify Build Command (No Bash Script)

**If bash script is causing issues, inline the commands:**

Update `netlify.toml`:

```toml
[build]
  publish = "out"
  command = "npm install && npm run build:workspace && npm run build:static"

[build.environment]
  NODE_VERSION = "20"
```

Add to `package.json`:

```json
{
  "scripts": {
    "build:workspace": "cd packages/contracts && npm install && npm run build && cd ../.. && cd packages/db && npm install && npm run db:generate && cd ../..",
    "build:static": "bash scripts/build-static.sh",
    "prebuild:static": "npm run build:workspace"
  }
}
```

---

### Option 4: Use Netlify Build Image with More Resources

If builds are timing out or running out of memory:

Update `netlify.toml`:

```toml
[build]
  publish = "out"
  command = "npm install && npm run build:static"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--legacy-peer-deps"
  # Increase build resources (if on paid plan)
  NETLIFY_USE_YARN = "false"
  NETLIFY_NPM_FLAGS = "--legacy-peer-deps"
```

---

### Option 5: Debug with Build Logs

**Add verbose logging to identify the exact failure:**

Update `scripts/build-static.sh`:

```bash
#!/bin/bash
set -e
set -x  # Enable debug mode

# Print environment
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"
echo "NODE_ENV: $NODE_ENV"

# Rest of script...
```

---

### Option 6: Use Docker Build (Most Reliable)

If all else fails, use a Docker-based build:

Create `.netlify/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/*/package*.json ./packages/*/

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build
RUN npm run build:static

# Output is in /app/out
```

Update `netlify.toml`:

```toml
[build]
  command = "docker build -f .netlify/Dockerfile -t build . && docker run --rm -v $(pwd)/out:/app/out build"
  publish = "out"
```

---

## Quick Diagnostic Steps

1. **Check Netlify Build Logs:**
   - Go to Netlify dashboard → Deploys → Click on failed build
   - Look for the exact error message

2. **Common Error Patterns:**
   - `bash: command not found` → Use full path: `/bin/bash scripts/build-static.sh`
   - `Prisma Client not generated` → Add `npm run db:generate` before build
   - `Cannot find module '@gravyty-labs/contracts'` → Build workspace packages first
   - `ENOENT` errors → Missing files or permissions
   - `Out of memory` → Increase build resources or optimize

3. **Test Locally with Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify build
   ```

4. **Check Environment Variables:**
   - Ensure all required env vars are set in Netlify dashboard
   - Settings → Environment variables

---

## Recommended Immediate Actions

1. **Update Node version to 20** in `netlify.toml`
2. **Add workspace package builds** before main build
3. **Ensure Prisma client is generated** (though it should be in node_modules)
4. **Add error handling** to build script
5. **Check Netlify build logs** for specific error

---

## Alternative: Use Vercel Instead

If Netlify continues to be problematic, Vercel has better Next.js support:

1. Better monorepo support
2. Automatic Next.js optimization
3. Better error messages
4. Easier configuration

---

## Next Steps

1. Check your Netlify build logs to identify the specific error
2. Try Option 1 first (most comprehensive fix)
3. If that doesn't work, share the specific error message for targeted help




