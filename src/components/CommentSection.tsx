"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CommentSection({ slug }: { slug: string }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="py-6 text-center text-muted-foreground text-sm">
        加载评论中...
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t border-border/50">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-accent" />
        评论
      </h3>
      <div
        className={cn(
          "giscus-wrapper min-h-[200px]",
          "[&_.giscus-frame]:w-full"
        )}
      >
        {/* Giscus iframe approach */}
        <iframe
          src={`https://giscus.app/widget?data-repo=Nemocccc%2FNemocccc.github.io&data-repo-id=&data-category=Announcements&data-mapping=pathname&data-strict=0&data-reactions-enabled=1&data-emit-metadata=0&data-input-position=top&data-theme=${theme === "dark" ? "dark" : "light"}&data-lang=${"zh-CN"}&data-loading=lazy`}
          title="Comments"
          className="w-full border-none"
          style={{ minHeight: "300px" }}
          loading="lazy"
        />
      </div>
      <p className="text-xs text-muted-foreground/60 mt-2">
        评论由 Giscus 驱动 — 需要 GitHub 账号
      </p>
    </div>
  );
}
