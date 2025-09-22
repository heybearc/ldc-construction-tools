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
}

module.exports = nextConfig
