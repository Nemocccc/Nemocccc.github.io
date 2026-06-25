import { getAllPosts } from "../lib/blogs";
import { Feed } from "feed";
import fs from "fs";
import path from "path";

const siteUrl = "https://nemocccc.github.io";

export function generateRssFeed() {
  const posts = getAllPosts();
  const feed = new Feed({
    title: "Nemo's Blog",
    description: "Personal blog about tech, AI, and life",
    id: siteUrl,
    link: siteUrl,
    language: "zh",
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, Nemo`,
    updated: new Date(),
    generator: "Next.js",
    feedLinks: {
      rss2: `${siteUrl}/rss.xml`,
      atom: `${siteUrl}/atom.xml`,
      json: `${siteUrl}/feed.json`,
    },
  });

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: `${siteUrl}/blogs/${post.slug}`,
      link: `${siteUrl}/blogs/${post.slug}`,
      description: post.description,
      content: post.content,
      date: new Date(post.date),
    });
  });

  const outDir = path.join(process.cwd(), "public");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "rss.xml"), feed.rss2());
  fs.writeFileSync(path.join(outDir, "atom.xml"), feed.atom1());
  fs.writeFileSync(path.join(outDir, "feed.json"), feed.json1());

  console.log("✅ RSS feeds generated in public/");
}

generateRssFeed();
