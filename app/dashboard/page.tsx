"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, ExternalLink, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/header";
import { airdropSol } from "@/lib/airdrop";
import Link from "next/link";
import { useVault } from "@/components/vault-provider";
import { useRouter } from "next/navigation";
import { type WalletData } from "@/lib/crypto";

export default function Dashboard() {
  const { vault, isUnlocked, isLoading, getWalletByPublicKey } = useVault();
  const router = useRouter();
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [amount, setAmount] = useState("");
  const [loadingAirdrop, setLoadingAirdrop] = useState(false);

  useEffect(() => {
    if (!isLoading && !isUnlocked) {
      router.push("/");
    }

    if (vault && vault.wallets.length > 0 && !selectedWallet) {
      setSelectedWallet(vault.wallets[0]);
    }
  }, [isUnlocked, isLoading, vault, selectedWallet, router]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast("Copied!", { description: `${label} copied to clipboard` });
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };

  const handleAirdrop = async () => {
    const parsedAmount = parseFloat(amount);
    if (!selectedWallet || !amount || isNaN(parsedAmount)) {
      toast.error("Invalid Input", {
        description: "Please select a wallet and enter a valid amount",
      });
      return;
    }

    setLoadingAirdrop(true);
    try {
      const result = await airdropSol(selectedWallet.publicKey, parsedAmount);
      if (result.success === true && result.signature) {
        toast.success("Airdrop Successful!", {
          description: `${amount} SOL sent to your wallet`,
        });
        setAmount("");
      } else {
        toast.error("Airdrop Failed", {
          description: "Please try again later",
        });
      }
    } catch (err) {
      console.error("Airdrop error:", err);
      toast.error("Airdrop Failed", { description: "An error occurred." });
    } finally {
      setLoadingAirdrop(false);
    }
  };

  if (isLoading || !isUnlocked || !vault) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mt-24 md:mt-28 container mx-auto px-4 md:px-6 max-w-4xl">
        {vault.wallets.length > 0 && selectedWallet ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  My Wallets
                </CardTitle>
                <CardDescription>
                  Your encrypted {vault.blockchain} wallets
                </CardDescription>
                <CardAction>
                  <Select
                    defaultValue="0"
                    onValueChange={(value) => {
                      const index = Number(value);
                      setSelectedWallet(vault.wallets[index]);
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Choose Wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {vault.wallets.map((w, i) => (
                        <SelectItem key={i} value={String(i)}>
                          Wallet {w.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Public Key</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={selectedWallet.publicKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(selectedWallet.publicKey, "Public key")
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Private Key</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={selectedWallet.privateKey}
                      readOnly
                      type="password"
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(
                          selectedWallet.privateKey,
                          "Private key"
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Wallet Generator
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Airdrop</CardTitle>
                <CardDescription>
                  Get test SOL on devnet (for selected wallet)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="publicKey">Public Key</Label>
                  <Input
                    id="publicKey"
                    value={selectedWallet.publicKey}
                    readOnly
                    className="mt-1.5 font-mono text-sm bg-muted"
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount (SOL)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount (e.g., 1)"
                    min="0.1"
                    max="2"
                    step="0.1"
                    className="mt-1.5 font-mono text-sm"
                  />
                </div>

                <Button
                  onClick={handleAirdrop}
                  disabled={loadingAirdrop}
                  className="w-full"
                >
                  {loadingAirdrop && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {loadingAirdrop ? "Processing..." : "Request Airdrop"}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Wallets Found</CardTitle>
              <CardDescription>
                You haven&apos;t generated any wallets yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/">
                  <Wallet className="h-4 w-4 mr-2" />
                  Generate Wallets
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
