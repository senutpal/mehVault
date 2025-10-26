"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Wallet {
  id: number;
  publicKey: string;
  privateKey: string;
}

interface WalletCardProps {
  wallet: Wallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied", {
      description: `${label} copied to clipboard.`,
    });
  };

  return (
    <Card className="p-4 md:p-6  border border-accent-foreground/20">
      <h4 className="font-semibold text-base">Wallet {wallet.id}</h4>

      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">
              Public Key
            </label>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleCopy(wallet.publicKey, "Public key")}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="p-3 bg-muted/50 rounded-md font-mono text-xs md:text-sm break-all">
            {wallet.publicKey}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground">
              Private Key
            </label>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
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
                onClick={() => handleCopy(wallet.privateKey, "Private key")}
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
