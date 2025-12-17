/**
 * @fileoverview Dashboard page for wallet management and airdrop.
 *
 * @module app/dashboard/page
 */

"use client";

import { requestAirdrop } from "@/actions";
import { Header } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClipboard } from "@/hooks";
import { BLOCKCHAIN_CONFIGS, MAX_AIRDROP_AMOUNT, MIN_AIRDROP_AMOUNT } from "@/lib/constants";
import { useWallet } from "@/providers";
import type { Wallet as WalletType } from "@/types";
import { Copy, ExternalLink, Loader2, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ============================================================================
// Component
// ============================================================================

/**
 * Dashboard page for viewing wallets and requesting airdrops.
 * Redirects to home if no wallet data.
 */
export default function DashboardPage() {
  const router = useRouter();
  const { data, hasData, isLoading } = useWallet();
  const { copy } = useClipboard();

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  const [selectedWalletIndex, setSelectedWalletIndex] = useState(0);
  const [airdropAmount, setAirdropAmount] = useState("");
  const [isAirdropping, setIsAirdropping] = useState(false);

  // -------------------------------------------------------------------------
  // Derived State
  // -------------------------------------------------------------------------

  const selectedWallet: WalletType | undefined = data?.wallets[selectedWalletIndex];
  const blockchainName = data?.blockchain ? BLOCKCHAIN_CONFIGS[data.blockchain]?.name : "Unknown";
  const isSolana = data?.blockchain === "solana";

  // -------------------------------------------------------------------------
  // Effects
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!isLoading && !hasData) {
      router.push("/");
    }
  }, [isLoading, hasData, router]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleWalletChange = useCallback((value: string) => {
    setSelectedWalletIndex(Number(value));
  }, []);

  const handleAirdrop = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const amount = Number.parseFloat(airdropAmount);

      if (!selectedWallet) {
        toast.error("Please select a wallet");
        return;
      }

      if (Number.isNaN(amount) || amount < MIN_AIRDROP_AMOUNT || amount > MAX_AIRDROP_AMOUNT) {
        toast.error("Invalid amount", {
          description: `Amount must be between ${MIN_AIRDROP_AMOUNT} and ${MAX_AIRDROP_AMOUNT} SOL`,
        });
        return;
      }

      setIsAirdropping(true);

      try {
        const result = await requestAirdrop(selectedWallet.publicKey, amount);

        if (result.success) {
          toast.success("Airdrop successful!", {
            description: `${amount} SOL sent to your wallet`,
          });
          setAirdropAmount("");
        } else {
          toast.error("Airdrop failed", {
            description: result.error,
          });
        }
      } catch (error) {
        console.error("Airdrop error:", error);
        toast.error("Airdrop failed", {
          description: "An unexpected error occurred",
        });
      } finally {
        setIsAirdropping(false);
      }
    },
    [selectedWallet, airdropAmount]
  );

  // -------------------------------------------------------------------------
  // Loading State
  // -------------------------------------------------------------------------

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const hasWallets = data.wallets.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mt-24 md:mt-28 container mx-auto px-4 md:px-6 max-w-4xl pb-12">
        {hasWallets && selectedWallet ? (
          <div className="space-y-6">
            {/* Wallet Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  My Wallets
                </CardTitle>
                <CardDescription>Your {blockchainName} wallets</CardDescription>
                <CardAction>
                  <Select value={String(selectedWalletIndex)} onValueChange={handleWalletChange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Choose Wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.wallets.map((wallet, index) => (
                        <SelectItem key={wallet.id} value={String(index)}>
                          Wallet {wallet.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardAction>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Public Key */}
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
                      onClick={() => copy(selectedWallet.publicKey, "Public key")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Private Key */}
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
                      onClick={() => copy(selectedWallet.privateKey, "Private key")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Generator Link */}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/wallets">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Wallet Generator
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Airdrop Card (Solana only) */}
            {isSolana && (
              <Card>
                <CardHeader>
                  <CardTitle>Request Airdrop</CardTitle>
                  <CardDescription>Get test SOL on devnet (for selected wallet)</CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleAirdrop} className="space-y-4">
                    {/* Public Key (read-only) */}
                    <div>
                      <Label htmlFor="airdrop-pubkey">Public Key</Label>
                      <Input
                        id="airdrop-pubkey"
                        value={selectedWallet.publicKey}
                        readOnly
                        className="mt-1.5 font-mono text-sm bg-muted"
                      />
                    </div>

                    {/* Amount Input */}
                    <div>
                      <Label htmlFor="airdrop-amount">Amount (SOL)</Label>
                      <Input
                        id="airdrop-amount"
                        type="number"
                        value={airdropAmount}
                        onChange={(e) => setAirdropAmount(e.target.value)}
                        placeholder={`Enter amount (${MIN_AIRDROP_AMOUNT}-${MAX_AIRDROP_AMOUNT})`}
                        min={MIN_AIRDROP_AMOUNT}
                        max={MAX_AIRDROP_AMOUNT}
                        step="0.1"
                        className="mt-1.5 font-mono text-sm"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" disabled={isAirdropping} className="w-full">
                      {isAirdropping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isAirdropping ? "Processing..." : "Request Airdrop"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* No Wallets */
          <Card>
            <CardHeader>
              <CardTitle>No Wallets Found</CardTitle>
              <CardDescription>You haven&apos;t generated any wallets yet.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/wallets">
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
