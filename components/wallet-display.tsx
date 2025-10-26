"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import type { Blockchain } from "@/app/page";
import { SeedPhraseDisplay } from "@/components/seed-phrase-display";
import { WalletCard } from "@/components/wallet-card";
import { toast } from "sonner";
import { mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import { HDNodeWallet } from "ethers";

interface WalletDisplayProps {
  blockchain: Blockchain;
  seedPhrase: string;
  onBack: () => void;
}

interface Wallet {
  id: number;
  publicKey: string;
  privateKey: string;
}

export function WalletDisplay({
  blockchain,
  seedPhrase,
  onBack,
}: WalletDisplayProps) {
  const [wallets, setWallets] = useState<Wallet[]>([]);

  const handleAddWallet = () => {
    try {
      const index = wallets.length; 

      let newWallet: Wallet;

      if (blockchain === "solana") {
        const path = `m/44'/501'/${index}'/0'`;
        const derivedSeed = derivePath(
          path,
          mnemonicToSeedSync(seedPhrase).toString("hex")
        ).key;
        const keypair = nacl.sign.keyPair.fromSeed(derivedSeed);
        const solanaKeypair = Keypair.fromSecretKey(keypair.secretKey);

        newWallet = {
          id: wallets.length + 1,
          publicKey: solanaKeypair.publicKey.toBase58(),
          privateKey: Buffer.from(solanaKeypair.secretKey).toString("hex"),
        };
      } else if (blockchain === "ethereum") {
        const ethPath = `m/44'/60'/0'/0/${index}`;
        const ethWallet = HDNodeWallet.fromPhrase(seedPhrase, ethPath);

        newWallet = {
          id: wallets.length + 1,
          publicKey: ethWallet.address,
          privateKey: ethWallet.privateKey,
        };
      } else {
        throw new Error("Unsupported blockchain");
      }

      setWallets([...wallets, newWallet]);
      toast.success("Wallet Added", {
        description: `Wallet ${newWallet.id} has been created successfully.`,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add wallet");
    }
  };

  const handleClearWallets = () => {
    setWallets([]);
    toast.warning("Wallets Cleared", {
      description: "All wallets have been removed.",
    });
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <SeedPhraseDisplay seedPhrase={seedPhrase} />

      <Card className="p-6 md:p-8 space-y-6 border-accent-foreground/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg md:text-xl font-semibold capitalize font-mono">
            {blockchain} Wallet
          </h3>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={handleAddWallet}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Wallet
            </Button>
            <Button
              onClick={handleClearWallets}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              disabled={wallets.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Wallets
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {wallets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No wallets. Click &quot;Add Wallet&quot; to create one.
            </div>
          ) : (
            wallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
