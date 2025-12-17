/**
 * @fileoverview Custom hook for clipboard operations with toast feedback.
 *
 * @module hooks/use-clipboard
 */

"use client";

import { useCallback } from "react";
import { toast } from "sonner";

/**
 * Custom hook for clipboard operations.
 * Provides a simple API for copying text with automatic toast notifications.
 *
 * @returns Object with copy function
 *
 * @example
 * ```tsx
 * function CopyButton({ text }: { text: string }) {
 *   const { copy } = useClipboard();
 *
 *   return (
 *     <button onClick={() => copy(text, "Address")}>
 *       Copy
 *     </button>
 *   );
 * }
 * ```
 */
export function useClipboard() {
  const copy = useCallback(async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied", {
        description: label ? `${label} copied to clipboard` : "Copied to clipboard",
      });
      return true;
    } catch (error) {
      toast.error("Failed to copy");
      console.error("Clipboard error:", error);
      return false;
    }
  }, []);

  return { copy };
}
