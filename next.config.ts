/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      // Add any other domains you encounter
    ],
  },
};

export default nextConfig;
