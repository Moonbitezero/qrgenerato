import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Short / old addresses people (and Google) may still use → the real page, so they never hit a 404
  async redirects() {
    return [
      { source: "/contact", destination: "/contact-us", permanent: true },
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
      { source: "/terms", destination: "/terms-and-conditions", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/scanner", destination: "/qr-code-scanner", permanent: true },
      { source: "/bulk", destination: "/bulk-qr-code-generator", permanent: true },
      { source: "/my-qr-codes", destination: "/my-codes", permanent: true },
    ];
  },
};

export default nextConfig;
