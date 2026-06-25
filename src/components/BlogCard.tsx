"use client";

import { type BlogPost } from "@/lib/blogs";
import { formatDate, readingTime, cn } from "@/lib/utils";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

const categoryColors: Record<string, string> = {
  tech: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  devops: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
  ai: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  life: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800",
  learning:
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  uncategorized:
    "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800",
};

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className={cn(
        "group block p-6 rounded-xl border border-border/50",
        "bg-card/40 hover:bg-card/80",
        "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        "hover:border-accent/30"
      )}
    >
      {/* Category tag */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium border",
            categoryColors[post.category] || categoryColors.uncategorized
          )}
        >
          {post.category}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors line-clamp-2">
        {post.title}
      </h2>

      {/* Description */}
      {post.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {post.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(post.date)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {readingTime(post.content) < 1 ? "<1" : readingTime(post.content)} 分钟阅读
        </span>
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-xs bg-muted/50 text-muted-foreground border border-border/30"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Read more */}
      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
        阅读全文 <ArrowRight className="w-3 h-3" />
      </div>
    </Link>
  );
}
