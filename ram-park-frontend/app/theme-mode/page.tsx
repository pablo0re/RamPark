"use client";
import { useState } from "react";

export default function ThemeModePage() {
  const [theme, setTheme] = useState("dark");

  return (
    <div className={`min-h-screen text-white p-6 transition-all duration-300 ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-[#0d2818] text-white'}`}>
      <div className={`mx-auto max-w-4xl rounded-2xl border p-8 transition-all duration-300 ${
        theme === 'light' 
          ? 'bg-white border-gray-200 shadow-lg' 
          : 'border-[#2a5438] bg-[#142a1e]'
      }`}>
        <h1 className={`text-3xl font-bold mb-2 ${theme === 'light' ? 'text-gray-900' : ''}`}>
          Theme Mode
        </h1>
        <p className={`text-emerald-200/80 mb-8 ${theme === 'light' ? 'text-gray-600' : ''}`}>
          App appearance
        </p>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border rounded-xl cursor-pointer group hover:border-emerald-500 transition-all">
            <span className={`${theme === 'light' ? 'font-semibold text-emerald-400' : ''}`}>
              Light mode
            </span>
            <div 
              className={`relative w-12 h-6 rounded-full transition-all duration-200 shadow-md ${
                theme === 'light' ? 'bg-emerald-500' : 'bg-[#2a5438]'
              }`}
              onClick={() => setTheme('light')}
            >
              <div 
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                  theme === 'light' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </label>

          <label className="flex items-center justify-between p-4 border rounded-xl bg-[#1a3d28]/50 border-emerald-500/50 cursor-pointer group hover:border-emerald-400 transition-all">
            <span className={`${theme === 'dark' ? 'font-semibold text-emerald-400' : ''}`}>
              Dark mode
            </span>
            <div 
              className={`relative w-12 h-6 rounded-full transition-all duration-200 shadow-md ${
                theme === 'dark' ? 'bg-emerald-500' : 'bg-[#2a5438]'
              }`}
              onClick={() => setTheme('dark')}
            >
              <div 
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}