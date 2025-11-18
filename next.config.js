/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable caching for development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Ensure environment variables are available
  env: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    PRODUCT_HUNT_API_TOKEN: process.env.PRODUCT_HUNT_API_TOKEN,
  },
}

module.exports = nextConfig
