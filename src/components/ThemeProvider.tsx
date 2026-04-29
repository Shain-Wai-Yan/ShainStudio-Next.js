'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION: Set the default theme for your portfolio here
// Options: 
//   - "system" (Automatically matches the user's computer/phone settings)
//   - "dark"   (Forces dark mode by default)
//   - "light"  (Forces light mode by default)
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_THEME_COLOR = "dark";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider 
      defaultTheme={DEFAULT_THEME_COLOR} 
      enableSystem 
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
