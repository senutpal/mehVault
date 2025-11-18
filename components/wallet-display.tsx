"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Loader2 } from "lucide-react";
import type { Blockchain, WalletData } from "@/lib/crypto";
import { SeedPhraseDisplay } from "@/components/seed-phrase-display";
import { WalletCard } from "@/components/wallet-card";
import { toast } from "sonner";
import { mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import { HDNodeWallet } from "ethers";
import { useVault } from "@/components/vault-provider";
import { useRouter } from "next/navigation";

interface WalletDisplayProps {
  blockchain: Blockchain;
  seedPhrase: string;
}

export function WalletDisplay({ blockchain, seedPhrase }: WalletDisplayProps) {
  const { vault, addWallet, clearWallets } = useVault();
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const handleAddWallet = async () => {
    if (!vault) return;
    setIsAdding(true);

    try {
      const index = vault.wallets.length;
      let newWallet: WalletData;

      if (blockchain === "solana") {
        const path = `m/44'/501'/${index}'/0'`;
        const derivedSeed = derivePath(
          path,
          mnemonicToSeedSync(seedPhrase).toString("hex")
        ).key;
        const keypair = nacl.sign.keyPair.fromSeed(derivedSeed);
        const solanaKeypair = Keypair.fromSecretKey(keypair.secretKey);

        newWallet = {
          id: vault.wallets.length + 1,
          publicKey: solanaKeypair.publicKey.toBase58(),
          privateKey: Buffer.from(solanaKeypair.secretKey).toString("hex"),
        };
      } else if (blockchain === "ethereum") {
        const ethPath = `m/44'/60'/0'/0/${index}`;
        const ethWallet = HDNodeWallet.fromPhrase(seedPhrase, ethPath);

        newWallet = {
          id: vault.wallets.length + 1,
          publicKey: ethWallet.address,
          privateKey: ethWallet.privateKey,
        };
      } else {
        throw new Error("Unsupported blockchain");
      }

      await addWallet(newWallet);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add wallet");
    } finally {
      setIsAdding(false);
    }
  };

  const handleClearWallets = async () => {
    if (confirm("Are you sure you want to clear all wallets?")) {
      await clearWallets();
    }
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 md:p-8 space-y-6 border-accent-foreground/20">
        <CardHeader className="p-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-lg md:text-xl capitalize font-mono">
            {blockchain} Wallets
          </CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={handleAddWallet}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              disabled={isAdding}
            >
              {isAdding ? (
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
              disabled={!vault || vault.wallets.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-4">
          {!vault || vault.wallets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No wallets yet. Click &quot;Add Wallet&quot; to create one.
            </div>
          ) : (
            vault.wallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleGoToDashboard}
        size="lg"
        className="w-full h-12 font-medium"
      >
        Go to Dashboard
      </Button>
    </div>
  );
}
