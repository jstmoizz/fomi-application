"use client";

import { Moon, Sun } from "lucide-react";

// Both icons render; CSS shows the right one, so server and client markup always match.
export default function ThemeToggle({ className = "" }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className={`relative grid size-9 place-items-center rounded-full text-ink-2 transition-[background-color,color,transform] duration-150 hover:bg-surface-2 hover:text-ink active:scale-90 ${className}`}
    >
      <Moon size={17} strokeWidth={1.9} aria-hidden="true" className="transition-transform duration-300 dark:hidden" />
      <Sun size={17} strokeWidth={1.9} aria-hidden="true" className="hidden dark:block" />
    </button>
  );
}
