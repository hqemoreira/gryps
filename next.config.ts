import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/legal/terms", destination: "/terms", permanent: true },
      { source: "/legal/privacy", destination: "/privacy", permanent: true },
      { source: "/legal", destination: "/terms", permanent: true },
      { source: "/roadmap", destination: "/research-prototype", permanent: true },
    ]
  },
};

export default nextConfig;
