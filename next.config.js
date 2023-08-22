/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@resvg/resvg-js"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/dfaxbpkgx/image/fetch/**",
      },
    ],
  },
};

module.exports = nextConfig;
