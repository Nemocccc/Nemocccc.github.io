"use client";

import { useEffect, useState } from "react";
import { Star, GitFork, Code2, ExternalLink, Loader2 } from "lucide-react";
import { fetchPinnedRepos, type GitHubRepo } from "@/lib/github";
import { cn } from "@/lib/utils";

const languageColors: Record<string, string> = {
  Python: "bg-blue-500",
  TypeScript: "bg-blue-600",
  JavaScript: "bg-yellow-400",
  HTML: "bg-orange-500",
  CSS: "bg-purple-500",
  Java: "bg-red-500",
  Rust: "bg-orange-600",
  Go: "bg-cyan-500",
  Ruby: "bg-red-600",
  Shell: "bg-green-600",
  Makefile: "bg-yellow-600",
  Jupyter: "bg-orange-400",
};

export default function GitHubRepos() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPinnedRepos().then((data) => {
      setRepos(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (repos.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {repos.map((repo) => (
        <a
          key={repo.id}
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group relative p-4 rounded-xl border border-border/50",
            "bg-card/40 hover:bg-card/80",
            "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
            "hover:border-accent/30"
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-accent transition-colors">
              {repo.name}
            </h3>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-accent transition-colors shrink-0 mt-0.5" />
          </div>

          {/* Description */}
          {repo.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
              {repo.description}
            </p>
          )}

          {/* Footer with stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {repo.language && (
              <span className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    languageColors[repo.language] || "bg-gray-400"
                  )}
                />
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {repo.stargazers_count}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-3 h-3" />
              {repo.forks_count}
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
