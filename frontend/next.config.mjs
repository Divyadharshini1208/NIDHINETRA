/** @type {import('next').NextConfig} */
const DEFAULT_BACKEND = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://nidhinetra-ai-backend.onrender.com' 
    : 'http://localhost:8080');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  env: {
    NEXT_PUBLIC_API_URL: DEFAULT_BACKEND,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${DEFAULT_BACKEND}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
