/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL:    process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CLUB_UPI:   process.env.NEXT_PUBLIC_CLUB_UPI,
    NEXT_PUBLIC_CLUB_NAME:  process.env.NEXT_PUBLIC_CLUB_NAME,
  },
};
module.exports = nextConfig;
