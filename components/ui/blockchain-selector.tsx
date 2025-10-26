"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Blockchain } from "@/app/page";

interface BlockchainSelectorProps {
  onSelect: (blockchain: Blockchain) => void;
}

export function BlockchainSelector({ onSelect }: BlockchainSelectorProps) {
  return (
    <Card className="p-8 md:p-12 space-y-8 border-border/40">
      <div className="space-y-4 text-center">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
          mehVault supports multiple blockchains
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Choose a blockchain to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => onSelect("solana")}
          className="h-24 text-lg font-medium hover:bg-accent hover:border-foreground/20 transition-all"
        >
          Solana
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => onSelect("ethereum")}
          className="h-24 text-lg font-medium hover:bg-accent hover:border-foreground/20 transition-all"
        >
          Ethereum
        </Button>
      </div>
    </Card>
  );
}
