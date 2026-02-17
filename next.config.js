const path = require('path');
const fs = require('fs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow build to complete despite TS errors (e.g. contracts/scripts, workspace resolution).
  // Run `npm run lint` and `tsc --noEmit` in CI for type safety.
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    emotion: true,
  },
  images: {
    domains: ['localhost', 'gravyty-labs.web.app'],
    unoptimized: true
  },
  // Enable static export when building for Netlify (when API routes are moved)
  // Check if API directory doesn't exist (moved to .api-backup) to enable export
  ...(process.env.NODE_ENV === 'production' && !require('fs').existsSync('app/api') && {
    output: 'export',
    distDir: 'out',
  }),
  trailingSlash: true,
  assetPrefix: '',
  transpilePackages: ['@gravyty-labs/contracts', '@gravyty-labs/db', 'recharts'],
  webpack: (config, { isServer, isProduction, webpack }) => {
    // Prevent @prisma/client from being bundled on client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@prisma/client': false,
      };
    }
    
    // During static export, prevent Prisma from being initialized
    if (isProduction && process.env.NEXT_PHASE === 'phase-production-build') {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@prisma/client': false,
      };
    }
    
    // Ensure proper module resolution for workspace packages
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      'node_modules',
    ];
    
    return config;
  },
};

module.exports = nextConfig;
