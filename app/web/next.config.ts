import type { NextConfig } from "next";
import path from "node:path";

// API requests are proxied by web/app/api/[...path]/route.ts instead of a
// rewrite here, so the shared API key can be attached server-side. See
// web/lib/api-key.ts.
const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(__dirname, ".."),
  // Keep the installed application bundle read-only; use the memory cache.
  experimental: { isrFlushToDisk: false },
};

export default nextConfig;
