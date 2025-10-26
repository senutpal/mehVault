"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import type { Blockchain } from "@/app/page";
import { generateMnemonic } from "bip39";
import { toast } from "sonner";

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

  const handleGenerate = () => {
    const finalPhrase = phrase.trim() || generateMnemonic();
    onGenerate(finalPhrase);
    setPhrase(finalPhrase);
    toast.success("Wallet is ready");
  };

  return (
    <Card className="p-8 md:p- border border-accent-foreground/40">
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
          <p className="text-xs text-muted-foreground">
            Save these words in a safe place.
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter your recovery phrase or leave empty to generate"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            className="h-12 text-center"
          />

          <Button
            onClick={handleGenerate}
            size="lg"
            className="w-full h-12 font-medium"
          >
            Generate Wallet
          </Button>
        </div>
      </div>
    </Card>
  );
}
