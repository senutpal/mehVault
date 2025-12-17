/**
 * @fileoverview Seed phrase display component with copy functionality.
 *
 * @module components/seed-phrase/seed-phrase-display
 */

"use client";

import { useClipboard } from "@/hooks";
import { Copy } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface SeedPhraseDisplayProps {
  /** BIP39 mnemonic seed phrase to display */
  seedPhrase: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Displays a seed phrase in a grid format with copy functionality.
 * Shows each word with its index number for verification.
 *
 * @example
 * ```tsx
 * <SeedPhraseDisplay seedPhrase="word1 word2 word3 ..." />
 * ```
 */
export function SeedPhraseDisplay({ seedPhrase }: SeedPhraseDisplayProps) {
  const { copy } = useClipboard();
  const words = seedPhrase.split(" ");

  const handleCopy = () => {
    copy(seedPhrase, "Seed phrase");
  };

  return (
    <button
      type="button"
      className="w-full text-left p-6 md:p-8 border border-accent-foreground/20 cursor-pointer hover:bg-accent/50 transition-colors group bg-card text-card-foreground rounded-xl shadow-sm"
      onClick={handleCopy}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold font-mono">Your Secret Phrase</h3>
          <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>

        {/* Word Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {words.map((word, index) => (
            <div
              key={`${index}-${word}`}
              className="flex items-center gap-2 p-3 bg-muted/50 rounded-md font-mono text-sm"
            >
              <span className="text-xs text-muted-foreground tabular-nums">{index + 1}.</span>
              <span className="font-medium">{word}</span>
            </div>
          ))}
        </div>

        {/* Hint */}
        <p className="text-end mr-2 text-xs text-muted-foreground mt-6">Click anywhere to copy</p>
      </div>
    </button>
  );
}
