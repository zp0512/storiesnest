/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['storage.googleapis.com'],
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint during build
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TypeScript errors during build
  }
}

module.exports = nextConfig 