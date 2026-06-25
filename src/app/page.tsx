"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import GitHubRepos from "@/components/GitHubRepos";
import SearchDialog from "@/components/SearchDialog";
import { useTranslations } from "@/i18n/index";
import { ArrowRight, FileText, Globe } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-orange-500/5 to-pink-500/5 dark:from-rose-500/10 dark:via-orange-500/10 dark:to-pink-500/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(225,29,72,0.05),transparent_50%)]" />

          <div className="relative max-w-5xl mx-auto px-4 py-20 sm:py-28">
            <div className="text-center space-y-6">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-accent/20 ring-offset-2 ring-offset-background">
                  <img
                    src="https://avatars.githubusercontent.com/u/138976623?v=4"
                    alt="Nemo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                <span className="gradient-text">Nemo</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {t("home.hero_subtitle")}
              </p>

              <p className="text-sm text-muted-foreground/70 italic max-w-md mx-auto">
                &ldquo;chasing dreams&rdquo;
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <Link
                  href="/blogs"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-white font-medium text-sm
                    hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/25
                    transition-all duration-300 active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  {t("home.view_blogs")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/resume"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/50
                    text-foreground font-medium text-sm
                    hover:bg-muted/50 hover:border-accent/30
                    transition-all duration-300 active:scale-95"
                >
                  {t("home.view_resume")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* GitHub Section */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-8">
            <Globe className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold">{t("home.pinned_repos")}</h2>
          </div>
          <GitHubRepos />
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
