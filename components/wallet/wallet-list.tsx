/**
 * @fileoverview Wallet list with generation controls.
 *
 * @module components/wallet/wallet-list
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWalletGeneration } from "@/hooks";
import { BLOCKCHAIN_CONFIGS } from "@/lib/constants";
import { useWallet } from "@/providers";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { WalletCard } from "./wallet-card";

// ============================================================================
// Types
// ============================================================================

interface WalletListProps {
  /** Seed phrase for wallet generation */
  seedPhrase: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Displays list of wallets with add/clear controls.
 * Uses the wallet context for wallet data and operations.
 */
export function WalletList({ seedPhrase }: WalletListProps) {
  const { data, clearWallets } = useWallet();
  const { generateWallet, isGenerating } = useWalletGeneration(
    seedPhrase,
    data?.blockchain ?? "solana"
  );

  const blockchainName = data?.blockchain ? BLOCKCHAIN_CONFIGS[data.blockchain]?.name : "Unknown";

  const handleClearWallets = () => {
    const confirmed = window.confirm("Are you sure you want to clear all wallets?");
    if (confirmed) {
      clearWallets();
    }
  };

  const hasWallets = data && data.wallets.length > 0;

  return (
    <Card className="p-6 md:p-8 space-y-6 border-accent-foreground/20">
      {/* Header */}
      <CardHeader className="p-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle className="text-lg md:text-xl font-mono">{blockchainName} Wallets</CardTitle>

        {/* Actions */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={generateWallet}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Add Wallet
          </Button>

          <Button
            onClick={handleClearWallets}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            disabled={!hasWallets}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </CardHeader>

      {/* Wallet Cards */}
      <CardContent className="p-0 space-y-4">
        {!hasWallets ? (
          <div className="text-center py-8 text-muted-foreground">
            No wallets yet. Click &quot;Add Wallet&quot; to create one.
          </div>
        ) : (
          data.wallets.map((wallet) => <WalletCard key={wallet.id} wallet={wallet} />)
        )}
      </CardContent>
    </Card>
  );
}
