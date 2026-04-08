"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className="rounded-md border px-3 py-2 text-sm"
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className="rounded-md border px-3 py-2 text-sm"
      >
        Dark
      </button>
      <button
        type="button"
        onClick={() => setTheme("system")}
        className="rounded-md border px-3 py-2 text-sm"
      >
        System
      </button>

      <span className="text-sm text-gray-500 dark:text-gray-300">
        Current: {theme}
      </span>
    </div>
  );
}