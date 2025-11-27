/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "locallab.com.my" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "tomaz.my" },
      { protocol: "https", hostname: "smartmaster.com.my" },
    ],
  },
};

export default nextConfig;
