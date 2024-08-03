## deploy by yourself

https://nextjs.org/docs/app/building-your-application/deploying/static-exports


***first u must install gh-pages, run `pnpm install gh-pages --save-dev`***

add `"output": "export"` at your next.config.js, or you copy the follow:
```js
/** @type {import('next').NextConfig} */

const isGithubActions = process.env.GITHUB_ACTIONS || false;
let assetPrefix = "";
let basePath = "";

if (isGithubActions) {
  // 去掉 `<owner>/`
  const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, "");

  assetPrefix = `/${repo}/`;
  basePath = `/${repo}`;
  
}

const nextConfig = {
    basePath,
    assetPrefix,
    output: "export",
  };

export default nextConfig;
```

and in package.json: add `"deploy": ""gh-pages -d out""
```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "deploy": "gh-pages -d out"
  },
```

then you run `pnpm run build` and `pnpm run deploy` on bash.


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
