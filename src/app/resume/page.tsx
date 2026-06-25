"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { useTranslations } from "@/i18n/index";
import { FileDown, FileText } from "lucide-react";

export default function ResumePage() {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-accent" />
            <h1 className="text-3xl font-bold">{t("resume.title")}</h1>
          </div>
          <a
            href="/resume/resume.pdf"
            download
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white text-sm font-medium
              hover:bg-accent/90 transition-all duration-200 active:scale-95"
          >
            <FileDown className="w-4 h-4" />
            {t("resume.download")}
          </a>
        </div>

        {/* PDF Viewer */}
        <div className="rounded-xl border border-border/50 overflow-hidden bg-card/30">
          <iframe
            src="/resume/resume.pdf"
            className="w-full min-h-[60vh] sm:h-[80vh] border-none"
            title="Resume PDF"
          />
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
