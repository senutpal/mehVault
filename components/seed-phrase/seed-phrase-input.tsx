/**
 * @fileoverview Seed phrase input/generation component.
 *
 * @module components/seed-phrase/seed-phrase-input
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BLOCKCHAIN_CONFIGS } from "@/lib/constants";
import { generateSeedPhrase, isValidSeedPhrase } from "@/lib/crypto";
import type { Blockchain } from "@/types";
import { ArrowLeft } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { SeedPhraseDisplay } from "./seed-phrase-display";

// ============================================================================
// Types
// ============================================================================

interface SeedPhraseInputProps {
  /** Selected blockchain for context display */
  blockchain: Blockchain;
  /** Callback when seed phrase is confirmed */
  onConfirm: (phrase: string) => void;
  /** Callback when user wants to go back */
  onBack: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Seed phrase input component with generate/import functionality.
 * Two-step flow: input/generate, then confirm.
 *
 * @example
 * ```tsx
 * <SeedPhraseInput
 *   blockchain="solana"
 *   onConfirm={(phrase) => createVault(password, phrase, blockchain)}
 *   onBack={() => setStep("blockchain")}
 * />
 * ```
 */
export function SeedPhraseInput({ blockchain, onConfirm, onBack }: SeedPhraseInputProps) {
  const [inputPhrase, setInputPhrase] = useState("");
  const [generatedPhrase, setGeneratedPhrase] = useState<string | null>(null);

  const blockchainName = blockchain ? BLOCKCHAIN_CONFIGS[blockchain]?.name : "Unknown";

  const handleGenerate = (e: FormEvent) => {
    e.preventDefault();

    const trimmedPhrase = inputPhrase.trim().toLowerCase();

    // Validate if user entered a phrase
    if (trimmedPhrase && !isValidSeedPhrase(trimmedPhrase)) {
      toast.error("Invalid recovery phrase", {
        description: "Please enter a valid BIP39 mnemonic phrase.",
      });
      return;
    }

    // Use entered phrase or generate new one
    const phrase = trimmedPhrase || generateSeedPhrase();
    setGeneratedPhrase(phrase);

    toast.success("Recovery Phrase Ready", {
      description: "Save this phrase in a secure, offline location.",
    });
  };

  const handleConfirm = () => {
    if (generatedPhrase) {
      onConfirm(generatedPhrase);
    }
  };

  const handleBackFromConfirm = () => {
    setGeneratedPhrase(null);
  };

  // -------------------------------------------------------------------------
  // Confirmation Step
  // -------------------------------------------------------------------------

  if (generatedPhrase) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={handleBackFromConfirm} className="-ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="p-6 md:p-8 border-accent-foreground/20">
          <CardHeader className="p-0 text-center mb-6">
            <CardTitle className="text-xl md:text-2xl">Save Your Secret Phrase</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Write this down and store it safely. You&apos;ll need it to recover your wallet.
            </p>
          </CardHeader>

          <CardContent className="p-0 space-y-6">
            <SeedPhraseDisplay seedPhrase={generatedPhrase} />

            <Button onClick={handleConfirm} size="lg" className="w-full h-12 font-medium">
              I Have Saved My Phrase - Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Input Step
  // -------------------------------------------------------------------------

  return (
    <Card className="p-8 md:p-12 border border-accent-foreground/40">
      <Button
        variant="ghost"
        size="lg"
        onClick={onBack}
        className="mb-4 -ml-2 justify-start max-w-28"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h2 className="text-xl md:text-3xl font-semibold tracking-tight capitalize font-mono">
            {blockchainName} Wallet
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">Secret Recovery Phrase</p>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter your recovery phrase (or leave empty to generate)"
            value={inputPhrase}
            onChange={(e) => setInputPhrase(e.target.value)}
            className="h-12 text-center"
          />

          <Button type="submit" size="lg" className="w-full h-12 font-medium">
            {inputPhrase.trim() ? "Import Wallet" : "Generate New Wallet"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
