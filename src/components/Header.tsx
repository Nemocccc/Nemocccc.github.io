"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useTranslations } from "@/i18n/index";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", labelKey: "nav.home" },
  { href: "/blogs", labelKey: "nav.blogs" },
  { href: "/resume", labelKey: "nav.resume" },
];

export default function Header() {
  const pathname = usePathname();
  const { t } = useTranslations();

  return (
    <header className="sticky top-0 z-50 w-full glass backdrop-blur-md border-b border-border/50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold gradient-text hover:opacity-80 transition-opacity"
        >
          Nemo
        </Link>

        {/* Navigation */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
