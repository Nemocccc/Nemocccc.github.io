import { getAllPosts, getAllTags } from "@/lib/blogs";
import BlogListClient from "./BlogListClient";
import { Suspense } from "react";

export function generateStaticParams() {
  return [{}];
}

export default function BlogsPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>}>
      <BlogListClient posts={posts} tags={tags} />
    </Suspense>
  );
}
