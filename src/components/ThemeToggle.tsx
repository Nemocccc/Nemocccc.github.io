"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const themes = [
    { value: "light", icon: Sun, label: "浅色" },
    { value: "dark", icon: Moon, label: "深色" },
    { value: "system", icon: Monitor, label: "系统" },
  ] as const;

  const currentIndex = themes.findIndex((t) => t.value === theme);

  const cycleTheme = () => {
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  const Icon = themes[currentIndex]?.icon || Sun;

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "relative p-2 rounded-full transition-all duration-300",
        "hover:bg-muted/80 active:scale-90",
        "text-muted-foreground hover:text-foreground"
      )}
      aria-label={`当前主题: ${themes[currentIndex]?.label}`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
