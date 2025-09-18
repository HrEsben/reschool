import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  async headers() {
    if (process.env.NODE_ENV === 'production') {
      // Strict CSP in production
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=63072000; includeSubDomains; preload',
            },
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
                "worker-src 'self'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: blob: https:",
                "font-src 'self' data:",
                "connect-src 'self' https://api.stackframe.co https://api.stack-auth.com https://app.stack-auth.com https://api.novu.co https://ws.novu.co https://eu.api.novu.co https://eu.ws.novu.co https://1.1.1.1 https://vercel.live",
                "frame-src 'none'",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
                "upgrade-insecure-requests"
              ].join('; '),
            },
          ],
        }
      ];
    } else {
      // Permissive CSP in development to allow all external connections
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:",
                "worker-src 'self'",
                "style-src 'self' 'unsafe-inline' https: http:",
                "img-src 'self' data: blob: https: http:",
                "font-src 'self' data: https: http:",
                "connect-src 'self' https: http: ws: wss:",
                "frame-src 'self' https: http:",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'"
              ].join('; '),
            },
          ],
        }
      ];
    }
  },
};

export default nextConfig;
