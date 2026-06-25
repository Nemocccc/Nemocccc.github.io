"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, FileText, Loader2 } from "lucide-react";
import { useBlogStore } from "@/stores/blog";
import { getAllPosts, type BlogPost } from "@/lib/blogs";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SearchDialog() {
  const { searchQuery, setSearchQuery } = useBlogStore();
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    setAllPosts(getAllPosts());
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setResults([]);
      return;
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, setSearchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const q = query.toLowerCase();
    const filtered = allPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.content.toLowerCase().includes(q)
    );
    setResults(filtered.slice(0, 10));
    setLoading(false);
  };

  return (
    <>
      {/* Search trigger */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm",
          "bg-muted/50 border border-border/50",
          "text-muted-foreground hover:text-foreground",
          "transition-all duration-200 w-full sm:w-auto"
        )}
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">搜索文章...</span>
        <kbd className="hidden sm:inline-flex ml-auto items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-muted border border-border/50 text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Dialog */}
          <div
            className="relative w-full max-w-lg mx-4 rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="搜索文章标题、标签、内容..."
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60"
              />
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-2">
              {loading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {!loading && searchQuery && results.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  没有找到相关文章
                </div>
              )}

              {results.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blogs/${post.slug}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg",
                    "hover:bg-muted/50 transition-colors group"
                  )}
                >
                  <FileText className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="text-sm font-medium group-hover:text-accent transition-colors">
                      {post.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {post.description || post.content.slice(0, 80)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
