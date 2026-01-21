import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8787/api/:path*',
      },
      {
        source: '/mcp',
        destination: 'http://localhost:8787/mcp',
      },
    ];
  },
};

export default nextConfig;
