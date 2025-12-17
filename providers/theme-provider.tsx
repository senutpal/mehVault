/**
 * @fileoverview Theme provider wrapper for next-themes.
 *
 * @module providers/theme-provider
 */

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

/**
 * Theme provider component wrapping next-themes.
 * Enables dark/light mode switching with system preference detection.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
