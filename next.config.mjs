/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Puerto para dev local (evita el 3000 ocupado en PC de Ariel)
  ...(process.env.NODE_ENV !== 'production' ? { eslint: { ignoreDuringBuilds: true } } : {}),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
};

export default nextConfig;
