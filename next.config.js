/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'gravyty-labs.web.app'],
    unoptimized: true
  },
  // Only use static export for production builds, not development
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    distDir: 'out',
    // Skip API routes during static export (they're handled by Cloud Functions)
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  }),
  trailingSlash: true,
  assetPrefix: '',
  transpilePackages: ['@gravyty-labs/contracts', '@gravyty-labs/db'],
  webpack: (config, { isServer, isProduction }) => {
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
  
  // Custom export path map to exclude API routes during static export
  ...(process.env.NODE_ENV === 'production' && {
    async generateBuildId() {
      return 'static-export';
    },
  }),
};

module.exports = nextConfig;
