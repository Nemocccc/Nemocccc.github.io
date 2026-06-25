"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CommentSection from "@/components/CommentSection";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { type BlogPost } from "@/lib/blogs";
import { formatDate, readingTime, cn } from "@/lib/utils";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BlogArticleClient({
  post,
}: {
  post: BlogPost;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        {/* Back link */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          返回博客列表
        </Link>

        {/* Article header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {readingTime(post.content) < 1 ? "<1" : readingTime(post.content)} 分钟阅读
            </span>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blogs?tag=${tag}`}
                  className="px-3 py-1 rounded-full text-xs bg-muted/50 text-muted-foreground
                    hover:text-accent hover:bg-accent/5 border border-border/30 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Article content */}
        <article
          className={cn(
            "markdown-body",
            "prose prose-slate dark:prose-invert max-w-none",
            "prose-headings:scroll-mt-20",
            "prose-a:text-accent prose-a:no-underline hover:prose-a:underline"
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        {/* Comments */}
        <CommentSection slug={post.slug} />
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
