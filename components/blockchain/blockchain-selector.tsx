/**
 * @fileoverview Blockchain selection component.
 *
 * @module components/blockchain/blockchain-selector
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BLOCKCHAIN_CONFIGS } from "@/lib/constants";
import type { Blockchain } from "@/types";

// ============================================================================
// Types
// ============================================================================

interface BlockchainSelectorProps {
  /** Callback when a blockchain is selected */
  onSelect: (blockchain: Blockchain) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Blockchain selection component.
 * Displays available blockchain networks as selectable cards.
 *
 * @example
 * ```tsx
 * <BlockchainSelector
 *   onSelect={(blockchain) => {
 *     setSelectedBlockchain(blockchain);
 *     nextStep();
 *   }}
 * />
 * ```
 */
export function BlockchainSelector({ onSelect }: BlockchainSelectorProps) {
  const blockchains = Object.values(BLOCKCHAIN_CONFIGS);

  return (
    <Card className="p-8 md:p-12 space-y-8 border border-muted-foreground/40">
      {/* Header */}
      <div className="space-y-4 text-center">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
          mehVault supports multiple blockchains
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Choose a blockchain to get started
        </p>
      </div>

      {/* Blockchain Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
        {blockchains.map((config) => (
          <Button
            key={config.id}
            variant="outline"
            size="lg"
            onClick={() => onSelect(config.id)}
            className="h-24 text-lg font-medium hover:bg-accent hover:border-foreground/20 transition-all"
          >
            {config.name}
          </Button>
        ))}
      </div>
    </Card>
  );
}
