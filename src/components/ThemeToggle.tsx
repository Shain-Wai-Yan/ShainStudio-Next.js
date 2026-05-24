'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { BsSunFill, BsMoonFill } from 'react-icons/bs';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the exact same dimensions to prevent layout shift
    return <div className="w-9 h-9" />;
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex items-center justify-center p-2 rounded-md text-white hover:bg-[#ffd700]/20 hover:text-[#ffd700] transition-all duration-300 group"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <BsSunFill className="w-5 h-5 transition-transform duration-500 group-hover:rotate-180" />
      ) : (
        <BsMoonFill className="w-5 h-5 transition-transform duration-500 group-hover:-rotate-12" />
      )}
    </button>
  );
}
