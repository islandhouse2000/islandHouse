/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['utfs.io', 'api.slingacademy.com']
  },
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          }
        ]
      },
      {
        source: '/api/socket',
        headers: [
          { key: 'Upgrade', value: 'websocket' },
          { key: 'Connection', value: 'Upgrade' }
        ]
      }
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;