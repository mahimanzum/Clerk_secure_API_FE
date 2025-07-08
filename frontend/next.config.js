/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix for hot reloading websocket issues
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
  // Disable strict mode that can cause issues with Clerk
  reactStrictMode: false,
  // Optional: Reduce build output verbosity
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000']
    }
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  }
}

module.exports = nextConfig 