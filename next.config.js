/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'gravyty-labs.web.app'],
    unoptimized: true
  },
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  assetPrefix: '',
};

module.exports = nextConfig;
