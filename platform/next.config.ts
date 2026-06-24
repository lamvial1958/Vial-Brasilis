import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/**": ["./content/generated/**/*"],
  },
};

export default nextConfig;
