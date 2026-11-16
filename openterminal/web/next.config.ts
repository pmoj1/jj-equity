import type { NextConfig } from "next";

// API requests are proxied by web/app/api/[...path]/route.ts instead of a
// rewrite here, so the shared API key can be attached server-side. See
// web/lib/api-key.ts.
const nextConfig: NextConfig = {
  output: "standalone",
  // Keep the installed application bundle read-only; use the memory cache.
  experimental: { isrFlushToDisk: false },
};

export default nextConfig;
