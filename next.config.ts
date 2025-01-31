import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // experimental: {
  //   turbo: true,
  // },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'markdown-loader',
    });
    console.log('isServer:', isServer);
    return config;
  },
};


export default nextConfig;
