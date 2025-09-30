import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "@chakra-ui/react", 
      "@tanstack/react-query", 
      "react-icons",
      "date-fns"
    ],
  },
};

export default nextConfig;
