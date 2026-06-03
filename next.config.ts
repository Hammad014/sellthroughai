import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Admin uploads (cover images + gated files) go through Server Actions,
      // whose default body limit is 1 MB. Raise it for real files. For very
      // large assets, switch to direct-to-storage uploads later.
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
