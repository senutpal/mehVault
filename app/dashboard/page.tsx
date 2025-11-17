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
import { Copy, ExternalLink, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/header";
import { airdropSol } from "@/lib/airdrop";
import Link from "next/link";

interface WalletData {
  id: number;
  publicKey: string;
  privateKey: string;
}

export default function Dashboard() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const walletsData = localStorage.getItem("wallets");

    if (walletsData) {
      const parsed = JSON.parse(walletsData);

      if (parsed.length > 0) {
        setWallets(parsed);
        setPublicKey(parsed[0].publicKey);
        setPrivateKey(parsed[0].privateKey);
      }
    }
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied!", { description: `${label} copied to clipboard` });
  };

  const handleAirdrop = async () => {
    if (!publicKey || !amount) {
      toast("Error", {
        description: "Please enter both public key and amount",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await airdropSol(publicKey, parseFloat(amount));
      if (result.success !== false && result.signature) {
        toast.success("Airdrop Successful!", {
          description: `${amount} SOL sent to your wallet`,
        });
        setAmount("");
      } else {
        toast.error("Airdrop Failed", {
          description: "Please try again later",
        });
      }
    } catch {
      toast.error("Error", { description: "Failed to request airdrop" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mt-24 md:mt-28 container mx-auto px-4 md:px-6 max-w-4xl">
        {wallets.length > 0 ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Imported Wallet
                </CardTitle>
                <CardDescription>Your wallet credentials</CardDescription>
                <CardAction>
                  <Select
                    onValueChange={(value) => {
                      const index = Number(value);
                      setPublicKey(wallets[index].publicKey);
                      setPrivateKey(wallets[index].privateKey);
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Choose Wallet" />
                    </SelectTrigger>

                    <SelectContent>
                      {wallets.map((w, i) => (
                        <SelectItem key={i} value={String(i)}>
                          Wallet {i + 1}
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
                      value={publicKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(publicKey, "Public key")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Private Key</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={privateKey}
                      readOnly
                      type="password"
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(privateKey, "Private key")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Import Another Wallet
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Airdrop</CardTitle>
                <CardDescription>Get test SOL on devnet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="publicKey">Public Key</Label>
                  <Input
                    id="publicKey"
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    placeholder="Enter public key"
                    className="mt-1.5 font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount (SOL)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="0.1"
                    max="5"
                    step="0.1"
                    className="mt-1.5 not-[]:font-mono text-sm"
                  />
                </div>

                <Button
                  onClick={handleAirdrop}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Processing..." : "Request Airdrop"}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Wallet Found</CardTitle>
              <CardDescription>Import a wallet to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/">
                  <Wallet className="h-4 w-4 mr-2" />
                  Import Wallet
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
