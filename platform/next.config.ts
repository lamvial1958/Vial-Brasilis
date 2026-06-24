import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
  outputFileTracingIncludes: {
    "/**": ["./content/generated/**/*"],
  },
};

export default nextConfig;
