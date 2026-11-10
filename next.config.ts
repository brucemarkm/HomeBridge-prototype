import type { NextConfig } from "next";
const config: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  outputFileTracingIncludes: { "/api/pdf": ["./public/fonts/*.woff"] },
};
export default config;
