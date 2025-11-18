"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
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
import { Coins, Copy, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useVault } from "@/components/vault-provider";
import { useRouter } from "next/navigation";
import { type WalletData } from "@/lib/crypto";
import { Keypair, PublicKey } from "@solana/web3.js";
import { createMintForToken, mintNewTokens } from "@/lib/mintToken";

export default function TokenManager() {
  const { vault, isUnlocked, isLoading } = useVault();
  const router = useRouter();

  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [mintAddress, setMintAddress] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");

  const [isCreatingMint, setIsCreatingMint] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isUnlocked) {
      router.push("/");
    }
    if (vault && vault.wallets.length > 0 && !selectedWallet) {
      setSelectedWallet(vault.wallets[0]);
      setRecipientAddress(vault.wallets[0].publicKey);
    }
  }, [isUnlocked, isLoading, vault, selectedWallet, router]);

  const getSigner = () => {
    if (!selectedWallet) return null;
    try {
      const secretKey = Uint8Array.from(
        Buffer.from(selectedWallet.privateKey, "hex")
      );
      return Keypair.fromSecretKey(secretKey);
    } catch (error) {
      console.error("Error recreating keypair:", error);
      toast.error("Wallet Error", {
        description: "Invalid private key format",
      });
      return null;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast("Copied!", { description: `${label} copied` }))
      .catch(() => toast.error("Failed to copy"));
  };

  const handleCreateMint = async () => {
    const signer = getSigner();
    if (!signer) return;

    setIsCreatingMint(true);
    try {
      // Calls your provided logic
      const mintPublicKey = await createMintForToken(signer, signer.publicKey);
      const mintString = mintPublicKey.toBase58();

      setMintAddress(mintString);
      toast.success("Token Created!", {
        description: "New Mint Address generated.",
      });
    } catch (err) {
      console.error("Create Mint Error:", err);
      toast.error("Creation Failed", {
        description: "Check console for details.",
      });
    } finally {
      setIsCreatingMint(false);
    }
  };

  const handleMintTokens = async () => {
    const signer = getSigner();
    if (!signer || !mintAddress) {
      toast.error("Missing Data", {
        description: "Select wallet and create a mint first.",
      });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Invalid Amount", { description: "Enter a valid number." });
      return;
    }

    setIsMinting(true);
    try {
      const rawAmount = parsedAmount * Math.pow(10, 6);

      await mintNewTokens(
        signer,
        new PublicKey(mintAddress),
        new PublicKey(recipientAddress || signer.publicKey),
        rawAmount
      );

      toast.success("Tokens Minted!", {
        description: `${parsedAmount} tokens sent to recipient.`,
      });
      setAmount("");
    } catch (err) {
      console.error("Minting Error:", err);
      toast.error("Minting Failed", {
        description: "Failed to mint new tokens.",
      });
    } finally {
      setIsMinting(false);
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
    <div className="space-y-6">
      {vault.wallets.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Token Manager
            </CardTitle>
            <CardDescription>
              Create and mint SPL tokens on Devnet
            </CardDescription>
            <CardAction>
              <Select
                defaultValue="0"
                onValueChange={(value) => {
                  const index = Number(value);
                  setSelectedWallet(vault.wallets[index]);
                  setRecipientAddress(vault.wallets[index].publicKey);
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
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Wallets Found</CardTitle>
          </CardHeader>
        </Card>
      )}

      {selectedWallet && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Step 1: Create Token Mint
              </CardTitle>
              <CardDescription>
                Initialize a new token on the blockchain (6 decimals).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={mintAddress}
                  placeholder="No mint created yet..."
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                {mintAddress && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(mintAddress, "Mint Address")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button
                onClick={handleCreateMint}
                disabled={isCreatingMint || !!mintAddress}
                className="w-full"
              >
                {isCreatingMint && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mintAddress ? "Token Mint Created" : "Create New Token Mint"}
              </Button>
            </CardContent>
          </Card>

          <Card
            className={!mintAddress ? "opacity-50 pointer-events-none" : ""}
          >
            <CardHeader>
              <CardTitle className="text-base">Step 2: Mint Supply</CardTitle>
              <CardDescription>
                Mint new tokens to a specific wallet address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient Address</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="recipient"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="font-mono text-sm"
                    placeholder="Solana Wallet Address"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setRecipientAddress(selectedWallet.publicKey)
                    }
                    title="Paste my wallet"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="amount">Amount (Tokens)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="mt-1.5 font-mono text-sm"
                />
              </div>

              <Button
                onClick={handleMintTokens}
                disabled={isMinting || !mintAddress}
                className="w-full"
              >
                {isMinting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isMinting ? "Minting..." : "Mint Tokens"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
