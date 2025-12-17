/**
 * @fileoverview Individual wallet card with key display and copy.
 *
 * @module components/wallet/wallet-card
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClipboard } from "@/hooks";
import type { Wallet } from "@/types";
import { Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

// ============================================================================
// Types
// ============================================================================

interface WalletCardProps {
  /** Wallet data to display */
  wallet: Wallet;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Displays a single wallet with public/private keys.
 * Private key is hidden by default with toggle visibility.
 *
 * @example
 * ```tsx
 * <WalletCard wallet={vault.wallets[0]} />
 * ```
 */
export function WalletCard({ wallet }: WalletCardProps) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const { copy } = useClipboard();

  return (
    <Card className="p-4 md:p-6 border border-accent-foreground/20">
      {/* Wallet Header */}
      <h4 className="font-semibold text-base mb-4">Wallet {wallet.id}</h4>

      <div className="space-y-4">
        {/* Public Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Public Key</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => copy(wallet.publicKey, "Public key")}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="p-3 bg-muted/50 rounded-md font-mono text-xs md:text-sm break-all">
            {wallet.publicKey}
          </div>
        </div>

        {/* Private Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Private Key</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                aria-label={showPrivateKey ? "Hide private key" : "Show private key"}
              >
                {showPrivateKey ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copy(wallet.privateKey, "Private key")}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-md font-mono text-xs md:text-sm break-all">
            {showPrivateKey ? wallet.privateKey : "•".repeat(64)}
          </div>
        </div>
      </div>
    </Card>
  );
}
