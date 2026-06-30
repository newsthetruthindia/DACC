const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL:    process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CLUB_UPI:   process.env.NEXT_PUBLIC_CLUB_UPI,
    NEXT_PUBLIC_CLUB_NAME:  process.env.NEXT_PUBLIC_CLUB_NAME,
  },
};

module.exports = withPWA(nextConfig);
