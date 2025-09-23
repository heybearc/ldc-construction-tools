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
  // Enable React strict mode - Next.js 15 handles hydration better
  reactStrictMode: true,
  // SWC minification is enabled by default in Next.js 15
  // Next.js 15 specific optimizations
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Improved TypeScript support
  typescript: {
    ignoreBuildErrors: false,
  },
  // Enhanced ESLint integration
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
