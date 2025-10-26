"use client";

import { SeedPhraseInput } from "@/components/seed-phrase-input";
import { BlockchainSelector } from "@/components/blockchain-selector";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { useState, useEffect } from "react";
import { WalletDisplay } from "@/components/wallet-display";

export type Blockchain = "solana" | "ethereum" | null;
export type AppState = "blockchain-select" | "seed-input" | "wallet-view";

export default function Home() {
  const [selectedBlockchain, setSelectedBlockchain] =
    useState<Blockchain>(null);
  const [appState, setAppState] = useState<AppState>("blockchain-select");
  const [seedPhrase, setSeedPhrase] = useState<string>("");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    const storedBlockchain = localStorage.getItem("selectedBlockchain");
    const storedAppState = localStorage.getItem("appState");
    const storedSeedPhrase = localStorage.getItem("seedPhrase");

    if (storedBlockchain) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedBlockchain(storedBlockchain as Blockchain);
    }
    if (storedAppState) {
      setAppState(storedAppState as AppState);
    }
    if (storedSeedPhrase) {
      setSeedPhrase(storedSeedPhrase);
    }
    setIsHydrated(true);
  }, []);

  // Persist state changes
  useEffect(() => {
    if (!isHydrated) return;
    if (selectedBlockchain) {
      localStorage.setItem("selectedBlockchain", selectedBlockchain);
    } else {
      localStorage.removeItem("selectedBlockchain");
    }
  }, [selectedBlockchain, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("appState", appState);
  }, [appState, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    if (seedPhrase) {
      localStorage.setItem("seedPhrase", seedPhrase);
    } else {
      localStorage.removeItem("seedPhrase");
    }
  }, [seedPhrase, isHydrated]);

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
    localStorage.removeItem("selectedBlockchain");
    localStorage.removeItem("appState");
    localStorage.removeItem("seedPhrase");
    localStorage.removeItem("wallets");
  };

  // Prevent hydration mismatch
  if (!isHydrated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-1 md:mt-28 container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {appState === "blockchain-select" && (
            <BlockchainSelector onSelect={handleBlockchainSelect} />
          )}

          {appState === "seed-input" && (
            <SeedPhraseInput
              blockchain={selectedBlockchain!}
              onGenerate={handleGenerateWallet}
              onBack={handleBack}
            />
          )}
          {appState === "wallet-view" && (
            <WalletDisplay
              blockchain={selectedBlockchain!}
              seedPhrase={seedPhrase}
              onBack={handleBack}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
