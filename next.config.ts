import type { NextConfig } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  // Fully static site: `next build` writes plain HTML to out/.
  output: 'export',
  // Only set for the demo copy (see scripts/build-pages.sh).
  basePath,
  trailingSlash: true,
  // The static export has no image optimisation server. Photos are already sized (720×800, 200×200).
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
