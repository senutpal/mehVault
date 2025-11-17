"use client";

import { SeedPhraseInput } from "@/components/seed-phrase-input";
import { BlockchainSelector } from "@/components/blockchain-selector";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { useState, useEffect } from "react";
import { VaultAuth } from "@/components/vault-auth";
import { useVault } from "@/components/vault-provider";
import type { Blockchain } from "@/lib/crypto";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { WalletDisplay } from "@/components/wallet-display";

type AppStep = "auth" | "blockchain" | "seed" | "wallet-view";

export default function Home() {
  const [appStep, setAppStep] = useState<AppStep>("auth");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [tempBlockchain, setTempBlockchain] = useState<Blockchain>(null);
  const [tempSeedPhrase, setTempSeedPhrase] = useState<string>("");

  const { isUnlocked, hasVault, isLoading, login, createVault, logout, vault } =
    useVault();
  useEffect(() => {
    if (!isUnlocked) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAppStep("auth");
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (isUnlocked && appStep === "auth") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAppStep("blockchain");
    }
  }, [isUnlocked, appStep]);

  const handleAuth = async (password: string) => {
    if (hasVault) {
      const success = await login(password);
      if (success) {
        if (vault && vault.wallets.length > 0) {
          setAppStep("blockchain");
          toast.success(
            "Vault unlocked. Generate more wallets or go to dashboard."
          );
        } else {
          setAppStep("blockchain");
          toast.success("Vault unlocked. Now select your blockchain.");
        }
      }
    } else {
      setTempPassword(password);
      setAppStep("blockchain");
      toast.success("Password set. Now select your blockchain.");
    }
  };

  const handleReset = () => {
    localStorage.removeItem("mehVault_secure_data");
    window.location.reload();
  };

  const handleBlockchainSelect = (blockchain: Blockchain) => {
    setTempBlockchain(blockchain);
    setAppStep("seed");
  };

  const handleGenerateWallet = async (phrase: string) => {
    if (!isUnlocked) {
      if (!tempPassword || !tempBlockchain) {
        toast.error("Error creating vault. Please start over.");
        logout();
        setAppStep("auth");
        return;
      }
      const success = await createVault(tempPassword, phrase, tempBlockchain);
      if (success) {
        setTempSeedPhrase(phrase);
        setAppStep("wallet-view");
      } else {
        toast.error("Failed to create vault. Please try again.");
      }
    } else {
      // Existing user generating additional wallets
      setTempSeedPhrase(phrase);
      setTempBlockchain(vault?.blockchain || tempBlockchain);
      setAppStep("wallet-view");
    }
  };

  const handleBackFromSeed = () => {
    setAppStep("blockchain");
  };

  const handleBackFromBlockchain = () => {
    setAppStep("auth");
    setTempPassword(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-1 md:mt-28 container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {appStep === "auth" && !isUnlocked && (
            <VaultAuth
              isNewUser={!hasVault}
              onUnlock={handleAuth}
              onReset={handleReset}
            />
          )}

          {appStep === "blockchain" && (
            <BlockchainSelector
              onSelect={handleBlockchainSelect}
              onBack={handleBackFromBlockchain}
            />
          )}

          {appStep === "seed" && (
            <SeedPhraseInput
              blockchain={
                isUnlocked && vault ? vault.blockchain : tempBlockchain
              }
              onGenerate={handleGenerateWallet}
              onBack={handleBackFromSeed}
            />
          )}

          {appStep === "wallet-view" && tempSeedPhrase && (
            <WalletDisplay
              blockchain={
                isUnlocked && vault ? vault.blockchain : tempBlockchain
              }
              seedPhrase={tempSeedPhrase}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
