"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import type { Blockchain } from "@/lib/crypto";
import { generateMnemonic, validateMnemonic } from "bip39";
import { toast } from "sonner";
import { SeedPhraseDisplay } from "./seed-phrase-display";

interface SeedPhraseInputProps {
  blockchain: Blockchain;
  onGenerate: (phrase: string) => void;
  onBack: () => void;
}

export function SeedPhraseInput({
  blockchain,
  onGenerate,
  onBack,
}: SeedPhraseInputProps) {
  const [phrase, setPhrase] = useState("");
  const [generatedPhrase, setGeneratedPhrase] = useState<string | null>(null);

  const handleGenerate = () => {
    const trimmedPhrase = phrase.trim();

    if (trimmedPhrase && !validateMnemonic(trimmedPhrase)) {
      toast.error("Invalid recovery phrase", {
        description: "Please enter a valid BIP39 mnemonic phrase.",
      });
      return;
    }

    const finalPhrase = trimmedPhrase || generateMnemonic();
    setGeneratedPhrase(finalPhrase);
    toast.success("Recovery Phrase Generated", {
      description: "Save this phrase in a secure, offline location.",
    });
  };

  const handleConfirm = () => {
    if (generatedPhrase) {
      onGenerate(generatedPhrase);
    }
  };

  if (generatedPhrase) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setGeneratedPhrase(null)}
          className="-ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="p-6 md:p-8 border-accent-foreground/20">
          <CardHeader className="p-0 text-center mb-6">
            <CardTitle className="text-xl md:text-2xl">
              Save Your Secret Phrase
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Write this down and store it safely. You&apos;ll need it to
              recover your wallet.
            </p>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <SeedPhraseDisplay seedPhrase={generatedPhrase} />
            <Button
              onClick={handleConfirm}
              size="lg"
              className="w-full h-12 font-medium"
            >
              I Have Saved My Phrase - Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="p-8 md:p-12 border border-accent-foreground/40">
      <Button
        variant="ghost"
        size="lg"
        onClick={onBack}
        className="mb-2 -ml-2 justify-start max-w-28"
      >
        <ArrowLeft className="mr-2 size-4" />
        Back
      </Button>

      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-xl md:text-3xl font-semibold tracking-tight capitalize font-mono">
            {blockchain} Wallet
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Secret Recovery Phrase
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter your recovery phrase (or leave empty to generate)"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            className="h-12 text-center"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />

          <Button
            onClick={handleGenerate}
            size="lg"
            className="w-full h-12 font-medium"
          >
            {phrase.trim() ? "Import Wallet" : "Generate New Wallet"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
