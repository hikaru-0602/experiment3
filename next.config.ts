import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/kankodori-23918.firebasestorage.app/**",
      },
    ],
  },
};

export default nextConfig;
