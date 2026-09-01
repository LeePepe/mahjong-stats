import type { NextConfig } from "next";

const basePath = process.env.GITHUB_ACTIONS === "true" ? "/mahjong-stats" : "";
const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
