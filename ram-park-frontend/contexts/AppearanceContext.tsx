"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface AppearanceContextType {
  theme: string;
  fontSize: string;
  language: string;
  setTheme: (v: string) => void;
  setFontSize: (v: string) => void;
  setLanguage: (v: string) => void;
  saveAppearance: (theme: string, fontSize: string, language: string) => void;
}

const AppearanceContext = createContext<AppearanceContextType>({
  theme: "dark", fontSize: "medium", language: "en",
  setTheme: () => {}, setFontSize: () => {}, setLanguage: () => {},
  saveAppearance: () => {},
});

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState("medium");
  const [language, setLanguage] = useState("en");

  // Load from localStorage on startup
  useEffect(() => {
    const t = localStorage.getItem("rp_theme") || "dark";
    const f = localStorage.getItem("rp_fontSize") || "medium";
    const l = localStorage.getItem("rp_language") || "en";
    setTheme(t);
    setFontSize(f);
    setLanguage(l);
  }, []);

  // Apply font size globally whenever it changes
  useEffect(() => {
    document.documentElement.style.fontSize =
      fontSize === "small" ? "13px" : fontSize === "large" ? "17px" : "15px";
  }, [fontSize]);

 

  const saveAppearance = (newTheme: string, newFontSize: string, newLanguage: string) => {
    setTheme(newTheme);
    setFontSize(newFontSize);
    setLanguage(newLanguage);
    localStorage.setItem("rp_theme", newTheme);
    localStorage.setItem("rp_fontSize", newFontSize);
    localStorage.setItem("rp_language", newLanguage);
  };

  return (
    <AppearanceContext.Provider value={{ theme, fontSize, language, setTheme, setFontSize, setLanguage, saveAppearance }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export const useAppearance = () => useContext(AppearanceContext);