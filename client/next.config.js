/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/googled38457b6a5a09cd3.html',
        destination: '/api/google-verify',
      },
    ];
  },
};

module.exports = nextConfig;
