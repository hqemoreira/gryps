import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Keep Turbopack rooted on this package so package upgrades mid-session
  // cannot make Next infer the wrong workspace root under ./app.
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      { source: "/legal/terms", destination: "/terms", permanent: true },
      { source: "/legal/privacy", destination: "/privacy", permanent: true },
      { source: "/legal", destination: "/terms", permanent: true },
      { source: "/roadmap", destination: "/research-prototype", permanent: true },
    ];
  },
};

export default nextConfig;
