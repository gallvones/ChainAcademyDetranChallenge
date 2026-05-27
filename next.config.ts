import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.service-now.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
