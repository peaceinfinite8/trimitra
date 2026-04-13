const path = require('path')

const wpApiUrl = process.env.WP_API_URL ? new URL(process.env.WP_API_URL) : null

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: wpApiUrl
      ? [
          {
            protocol: wpApiUrl.protocol.replace(':', ''),
            hostname: wpApiUrl.hostname,
            pathname: '/**',
          },
        ]
      : [],
  },
}

module.exports = nextConfig
