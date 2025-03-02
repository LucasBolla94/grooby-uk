/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // Substituindo domains por remotePatterns
        pathname: '/**', // Permite todas as rotas dentro deste domínio
      },
    ],
  },
};

export default nextConfig;
