/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'images.unsplash.com',
            'encrypted-tbn0.gstatic.com',
        ],
    },
    compress: true,
    async rewrites() {
        return [
          {
            source: '/api/:path*',
            destination: 'https://mehmet-asker-food-backend.vercel.app/api/:path*',
          },
        ];
      },
}

module.exports = nextConfig 