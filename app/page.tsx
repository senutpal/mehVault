"use client";

import { BlockchainSelector } from "@/components/ui/blockchain-selector";
import { Footer } from "@/components/ui/footer";
import { Header } from "@/components/ui/header";
import { useState } from "react";

export type Blockchain = "solana" | "ethereum" | null;
export type AppState = "blockchain-select" | "seed-input" | "wallet-view";

export default function Home() {
  const [selectedBlockchain, setSelectedBlockchain] =
    useState<Blockchain>(null);
  const [appState, setAppState] = useState<AppState>("blockchain-select");
  const [seedPhrase, setSeedPhrase] = useState<string>("");

  const handleBlockchainSelect = (blockchain: Blockchain) => {
    setSelectedBlockchain(blockchain);
    setAppState("seed-input");
  };

  const handleGenerateWallet = (phrase: string) => {
    setSeedPhrase(phrase);
    setAppState("wallet-view");
  };

  const handleBack = () => {
    setAppState("blockchain-select");
    setSelectedBlockchain(null);
    setSeedPhrase("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {appState === "blockchain-select" && (
            <BlockchainSelector onSelect={handleBlockchainSelect} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
