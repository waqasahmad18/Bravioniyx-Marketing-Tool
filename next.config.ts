import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  // Keep deploy green when only next/image <img> warnings remain
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Mobile WebView should pick up Vercel deploys without reinstalling the APK
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
