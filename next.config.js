/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['utfs.io', 'api.slingacademy.com']
  },
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },

};

module.exports = nextConfig;
