require('dotenv').config();

// Import bundle analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Optimization configs
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable HTTP/2
  experimental: {
    largePageDataBytes: 128 * 1000, // 128KB
  },
  // Add compression for JS files
  webpack: (config, { dev, isServer }) => {
    // Only run in production client builds
    if (!dev && !isServer) {
      const TerserPlugin = require('terser-webpack-plugin');
      const CompressionPlugin = require('compression-webpack-plugin');
      
      // Optimize JS with Terser
      config.optimization.minimizer.push(
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
            mangle: true,
          },
        })
      );
      
      // Add gzip compression
      config.plugins.push(
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8,
        })
      );
    }
    return config;
  },
};

// Apply bundle analyzer wrapper
module.exports = withBundleAnalyzer(nextConfig);
