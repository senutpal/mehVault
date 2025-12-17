/**
 * @fileoverview Custom hook for detecting hydration completion.
 * Prevents hydration mismatch for client-only UI elements.
 *
 * @module hooks/use-mounted
 */

"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns true only after client-side hydration is complete.
 * Use this to conditionally render client-only UI elements.
 *
 * @returns true if component is mounted (hydration complete)
 *
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const isMounted = useMounted();
 *
 *   if (!isMounted) return null; // Prevent hydration mismatch
 *
 *   return <Button>{theme === "dark" ? <Sun /> : <Moon />}</Button>;
 * }
 * ```
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
