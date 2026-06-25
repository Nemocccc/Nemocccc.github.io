"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import BlogCard from "@/components/BlogCard";
import { useTranslations } from "@/i18n/index";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/lib/blogs";
import { Search, BookOpen } from "lucide-react";

export default function BlogListClient({
  posts,
  tags,
}: {
  posts: BlogPost[];
  tags: string[];
}) {
  const { t } = useTranslations();
  const searchParams = useSearchParams();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Read tag from URL query params on mount
  useEffect(() => {
    const tagFromUrl = searchParams.get("tag");
    if (tagFromUrl && tags.includes(tagFromUrl)) {
      setSelectedTag(tagFromUrl);
    }
  }, [searchParams, tags]);

  const filtered = useMemo(() => {
    let result = posts;
    if (selectedTag) {
      result = result.filter((p) => p.tags.includes(selectedTag));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.content.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, selectedTag, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-accent" />
            <h1 className="text-3xl font-bold">{t("blog.title")}</h1>
          </div>
          <p className="text-muted-foreground">{t("blog.subtitle")}</p>
        </div>

        {/* Search + Tags */}
        <div className="mb-8 space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("blog.search_placeholder")}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/50 bg-muted/30
                focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30
                text-sm transition-all"
            />
          </div>

          {/* Tag filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                !selectedTag
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border/30"
              )}
            >
              {t("blog.all_posts")}
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                  selectedTag === tag
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border/30"
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Blog cards grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">{t("blog.no_results")}</p>
          </div>
        )}
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
