/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // Mantém o placeholder permitido
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Firebase Storage correto
        pathname: '/v0/b/**', // Permite caminhos dentro do Firebase Storage
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com', // ✅ Adiciona suporte ao storage do Firebase
        pathname: '/**', // Permite qualquer caminho dentro do Google Cloud Storage
      },
    ],
  },
};

export default nextConfig;
