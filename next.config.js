/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  i18n: {
    locales: ['ko', 'en', 'th'],
    defaultLocale: 'ko',
  },
}

module.exports = nextConfig
