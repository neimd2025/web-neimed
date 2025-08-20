/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Hydration 경고 억제
  reactStrictMode: false,
  // Cross origin request 허용 (개발 환경)
  allowedDevOrigins: [
    '192.168.45.76',
    'localhost',
    '127.0.0.1'
  ],
  // Edge Runtime 경고 억제
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  images: {
    domains: ['kyibcvcwwvkldlasxyjn.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  headers: async () => {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
  // PWA 지원을 위한 설정
  async rewrites() {
    return [
      {
        source: '/manifest.json',
        destination: '/api/manifest',
      },
    ]
  },
}

export default nextConfig
