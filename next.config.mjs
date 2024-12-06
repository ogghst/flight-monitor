/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@mui/icons-material', '@mui/material']
  }
}

export default nextConfig;