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

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            <h1 className="text-2xl sm:text-3xl font-bold">{t("resume.title")}</h1>
          </div>
          <a
            href="/resume/resume.pdf"
            download
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-accent text-white text-xs sm:text-sm font-medium
              hover:bg-accent/90 transition-all duration-200 active:scale-95"
          >
            <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {t("resume.download")}
          </a>
        </div>

        {/* PDF Viewer - full height, proper scaling */}
        <div className="rounded-xl border border-border/50 overflow-hidden bg-card/30 shadow-sm">
          <object
            data="/resume/resume.pdf"
            type="application/pdf"
            className="w-full h-[70vh] sm:h-[80vh] lg:h-[85vh]"
            title="Resume PDF"
          >
            <iframe
              src="/resume/resume.pdf"
              className="w-full h-full border-none"
              title="Resume PDF"
            >
              <p className="text-muted-foreground p-4">
                您的浏览器不支持 PDF 预览，请
                <a href="/resume/resume.pdf" download className="text-accent underline ml-1">
                  下载 PDF 文件
                </a>
              </p>
            </iframe>
          </object>
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
