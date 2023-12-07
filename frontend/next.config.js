/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  transpilePackages: ["@resvg/resvg-js"],
  images: {
    loader: 'akamai',
    path: '/',
    domains: ['i.seadn.io'],
    // remotePatterns: [
    //   {
    //     protocol: "https",
    //     hostname: "res.cloudinary.com",
    //     port: "",
    //     pathname: "/dfaxbpkgx/image/fetch/**",
    //   },
    // ],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    });
    return config;
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
