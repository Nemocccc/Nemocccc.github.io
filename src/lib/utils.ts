import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale: string = "zh"): string {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return d.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", options);
}

export function readingTime(text: string): number {
  const cnChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const enWords = text
    .replace(/[\u4e00-\u9fff]/g, "")
    .split(/\s+/)
    .filter(Boolean).length;
  const wpm = 200;
  return Math.ceil((cnChars / 2 + enWords) / wpm);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s]+/g, "-")
    .replace(/[^\w\-\u4e00-\u9fff]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}
