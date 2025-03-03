/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // Mantém o placeholder como permitido
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com', // Adiciona suporte ao Firebase Storage
        pathname: '/**', // Permite qualquer caminho dentro deste domínio
      },
    ],
  },
};

export default nextConfig;
