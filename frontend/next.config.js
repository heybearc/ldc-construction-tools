/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://10.92.3.23:8000/api/v1/:path*',
      },
    ];
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Disable React strict mode to prevent hydration issues
  reactStrictMode: false,
  // Disable SWC minification which can cause hydration issues
  swcMinify: false,
}

module.exports = nextConfig
