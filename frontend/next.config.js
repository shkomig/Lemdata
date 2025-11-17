/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
      },
    ],
  },
  // Support RTL
  i18n: {
    locales: ['he', 'en'],
    defaultLocale: 'he',
    localeDetection: false,
  },
}

module.exports = nextConfig




