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
  eslint: { ignoreDuringBuilds: true },
};
module.exports = nextConfig;
