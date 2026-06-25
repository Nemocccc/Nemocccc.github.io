import { getAllPosts, getPostBySlug } from "@/lib/blogs";
import BlogArticleClient from "./BlogArticleClient";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return <BlogArticleClient post={post} />;
}
