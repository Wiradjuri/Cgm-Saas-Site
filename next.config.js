/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const flaskApiHost = process.env.FLASK_API_URL || 'http://127.0.0.1:5000';

    return [
      {
        source: '/api/:path*',
        destination: `${flaskApiHost}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
