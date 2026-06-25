import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/i18n/index";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nemo — Personal Space",
    template: "%s — Nemo",
  },
  description: "chasing dreams | 全栈开发者 · RAG & RL 爱好者",
  keywords: ["Nemo", "个人网站", "博客", "全栈开发", "RAG", "强化学习"],
  authors: [{ name: "Nemo" }],
  openGraph: {
    title: "Nemo — Personal Space",
    description: "chasing dreams | 全栈开发者 · RAG & RL 爱好者",
    type: "website",
    locale: "zh_CN",
  },
  icons: {
    icon: "/Image/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
        {/* 不蒜子访问统计 */}
        <script
          async
          src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"
        />
      </body>
    </html>
  );
}
