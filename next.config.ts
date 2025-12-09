import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' } as const,
      // Add any other domains you encounter
    ],
  },
  // eslint configuration is handled separately in Next.js 16+
  // webpack config for polling is removed as Turbopack handles watching efficiently
  turbopack: {},
};

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  disable: process.env.NODE_ENV === 'development',
});

export default withPWA(nextConfig);
