/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow cross-origin images if needed
  images: {
    domains: [],
  },
  // Ensure src/ is included in TypeScript compilation
  experimental: {},
};

export default nextConfig;
