/** @type {import('next').NextConfig} */
/**
 * Next.js configuration file that sets up API request rewrites to a Flask backend.
 * It reads the Flask API URL from the environment variable `FLASK_API_URL`, defaulting to `http://www.localhost:5000` if not set. This allows the Next.js frontend to proxy API requests to the Flask backend seamlessly.
 * The `rewrites` function defines a rewrite rule that matches any request starting with `/api/` and forwards it to the corresponding endpoint on the Flask backend. This setup is useful for development and production environments where the frontend and backend are hosted separately.
 * Example usage:
 * - If `FLASK_API_URL` is set to `http://api.example.com`, a request to `/api/users` will be proxied to `http://api.example.com/api/users`.
 * - If `FLASK_API_URL` is not set, a request to `/api/users` will be proxied to `http://www.localhost:5000/api/users`.
 */
const nextConfig = {
  async rewrites() {
    const flaskApiHost = process.env.FLASK_API_URL || 'http://www.localhost:5000';

    return [
      {
        source: '/api/:path*',
        destination: `${flaskApiHost}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
