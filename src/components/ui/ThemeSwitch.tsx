"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <div className="w-full flex items-center justify-between gap-6 rounded-md bg-(--color-bg) px-4 py-3 dark:bg-(--color-surface-2)">
      <img
        src="/icons/icon-light-theme.svg"
        alt="Light theme"
        width={19}
        height={19}
        className="h-[19px] w-[19px]"
      />

      <button
        type="button"
        className="relative h-5 w-10 rounded-full bg-(--color-primary) transition-colors hover:bg-(--color-primary-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2"
        aria-label="Toggle theme"
        aria-pressed={isDark}
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            isDark ? "translate-x-5" : ""
          }`}
          aria-hidden
        />
      </button>

      <img
        src="/icons/icon-dark-theme.svg"
        alt="Dark theme"
        width={16}
        height={16}
        className="h-4 w-4"
      />
    </div>
  );
}

