/** @type {import('next').NextConfig} */

// - - - 
// 以下是使用github actions部署到github pages时的配置
// const isGithubActions = process.env.GITHUB_ACTIONS || false;
// let assetPrefix = "";
// let basePath = "";

// if (isGithubActions) {
//   // 去掉 `<owner>/`
//   const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, "");

//   assetPrefix = `/${repo}/`;
//   basePath = `/${repo}`;
  
// }

// const nextConfig = {
//     basePath,
//     assetPrefix,
//     output: "export",
//   };
// - - -

const nextConfig = {
    // basePath: "/nextjs-blog",
    // assetPrefix: "/nextjs-blog/",
    output: "export",
  };

export default nextConfig;
