import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal self-contained server bundle for the Docker image (.next/standalone).
  output: "standalone",

  // The citycalls/ parent folder has its own package-lock.json; pin the
  // workspace root to this app so Turbopack/tracing don't pick the parent.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },

  // Old URLs that served the same pages — keep them working. Service pages
  // live at /services/<slug> (src/data/helpNowServices.ts).
  async redirects() {
    return [
      { source: "/help-now", destination: "/", permanent: true },
      { source: "/dish-washing", destination: "/services/dish-washing", permanent: true },
      { source: "/help-now/dish-washing", destination: "/services/dish-washing", permanent: true },
      { source: "/help-now/services/:slug", destination: "/services/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
