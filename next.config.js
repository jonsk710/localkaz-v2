/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: [
    "@supabase/ssr",
    "leaflet",
    "react-leaflet",
    "react-leaflet-cluster",
  ],
  images: { unoptimized: true },
  swcMinify: true,
  experimental: { optimizePackageImports: ["@supabase/supabase-js"] },
  eslint: {
    /** Empêche le build de casser sur des erreurs ESLint */
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
