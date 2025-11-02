import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker standalone output
  output: "standalone",

  // Allow ESLint warnings during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optymalizacje wydajności
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "@tanstack/react-query",
      "zustand",
      "react-dropzone",
    ],
  },

  // Konfiguracja Turbopack (nowa lokalizacja)
  turbopack: {
    resolveAlias: {
      // Aliasy dla lepszej wydajności
      "@": "./src",
    },
  },

  // Kompresja
  compress: true,

  // Optymalizacja obrazów
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dni cache
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3002",
        pathname: "/uploads/**",
      },
    ],
  },

  async rewrites() {
    // Use environment variable for API URL, fallback to localhost
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiUrl}/auth/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
