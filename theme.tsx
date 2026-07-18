"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type ThemeMode = "dark" | "light" | "purple";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: "dark", setTheme: () => {} });

export function useTheme() { return useContext(ThemeContext); }

export const THEMES: Record<ThemeMode, {
  label: string; emoji: string;
  bg: string; card: string; border: string;
  text: string; muted: string; inputBg: string;
  health: string; finance: string; danger: string; warning: string;
  navBg: string;
}> = {
  dark: {
    label: "Escuro", emoji: "🌙",
    bg: "#0D0F14", card: "#161A23", border: "#252A36",
    text: "#F0F2F7", muted: "#6B7280", inputBg: "#1E2433",
    health: "#00E5A0", finance: "#7C6AF7", danger: "#FF6B6B", warning: "#FFB347",
    navBg: "rgba(13,15,20,0.95)",
  },
  light: {
    label: "Claro", emoji: "☀️",
    bg: "#F4F6FA", card: "#FFFFFF", border: "#E2E8F0",
    text: "#1A202C", muted: "#718096", inputBg: "#EDF2F7",
    health: "#00B37E", finance: "#6C5CE7", danger: "#E53E3E", warning: "#DD6B20",
    navBg: "rgba(244,246,250,0.97)",
  },
  purple: {
    label: "Roxo", emoji: "💜",
    bg: "#13071E", card: "#1E0F35", border: "#2D1B54",
    text: "#F0E6FF", muted: "#9B8EC4", inputBg: "#260D45",
    health: "#A78BFA", finance: "#F472B6", danger: "#FB7185", warning: "#FCD34D",
    navBg: "rgba(19,7,30,0.95)",
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("vitaltrack_theme") as ThemeMode | null;
    if (saved && THEMES[saved]) setThemeState(saved);
  }, []);

  function setTheme(t: ThemeMode) {
    setThemeState(t);
    localStorage.setItem("vitaltrack_theme", t);
    // Apply CSS vars globally
    const tk = THEMES[t];
    const root = document.documentElement;
    root.style.setProperty("--vt-bg", tk.bg);
    root.style.setProperty("--vt-card", tk.card);
    root.style.setProperty("--vt-border", tk.border);
    root.style.setProperty("--vt-text", tk.text);
    root.style.setProperty("--vt-muted", tk.muted);
    root.style.setProperty("--vt-input", tk.inputBg);
    root.style.setProperty("--vt-health", tk.health);
    root.style.setProperty("--vt-finance", tk.finance);
    root.style.setProperty("--vt-danger", tk.danger);
    root.style.setProperty("--vt-warning", tk.warning);
    root.style.setProperty("--vt-nav", tk.navBg);
  }

  // Apply on mount
  useEffect(() => { setTheme(theme); }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
