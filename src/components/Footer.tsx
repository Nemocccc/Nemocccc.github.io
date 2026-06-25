"use client";

import { useTranslations } from "@/i18n/index";
import {
  Globe,
  Mail,
  Heart,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const friendLinks = [
  { name: "My GitHub", url: "https://github.com/Nemocccc" },
  { name: "Sunwuzhou03", url: "https://sunwuzhou03.github.io/" },
];

const socialLinks = [
  { icon: Globe, href: "https://github.com/Nemocccc", label: "GitHub" },
  { icon: Mail, href: "mailto:1774747097@qq.com", label: "Email" },
];

export default function Footer() {
  const { t, lang } = useTranslations();
  const [showFriends, setShowFriends] = useState(false);

  return (
    <footer className="border-t border-border/50 bg-card/30 mt-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            {t("footer.copyright")}
          </p>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full text-muted-foreground hover:text-foreground
                  hover:bg-muted/50 transition-all duration-200"
                aria-label={link.label}
              >
                <link.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Friend links toggle */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowFriends(!showFriends)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("footer.friend_links")} · {t("footer.friend_links_desc")}
          </button>

          {showFriends && (
            <div className="mt-3 flex flex-wrap justify-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              {friendLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs",
                    "bg-muted/50 hover:bg-muted border border-border/50",
                    "text-muted-foreground hover:text-foreground",
                    "transition-all duration-200"
                  )}
                >
                  {link.name}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Made with love */}
        <div className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground/60">
          <span>Built with</span>
          <Heart className="w-3 h-3 text-accent fill-accent" />
          <span>using Next.js & Tailwind</span>
        </div>

        {/* 不蒜子访问统计 */}
        <div className="mt-2 text-center text-xs text-muted-foreground/40">
          <span id="busuanzi_container_site_pv">
            👁️ <span id="busuanzi_value_site_pv"></span> visits
          </span>
        </div>
      </div>
    </footer>
  );
}
