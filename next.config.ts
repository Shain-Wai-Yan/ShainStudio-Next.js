import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'api.shainwaiyan.com',
      },
      {
        protocol: 'https',
        hostname: 'backend-cms-89la.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'personal-cms-backup.onrender.com',
      },
    ],
  },
};

export default nextConfig;