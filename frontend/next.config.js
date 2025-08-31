/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://10.92.3.23:8000/api/:path*',
      },
    ];
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
}

module.exports = nextConfig
