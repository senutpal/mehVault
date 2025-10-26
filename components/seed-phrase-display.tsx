"use client";

import { Card } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface SeedPhraseDisplayProps {
  seedPhrase: string;
}

export function SeedPhraseDisplay({ seedPhrase }: SeedPhraseDisplayProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(seedPhrase);
    toast("Copied", {
      description: "Seed phrase copied to clipboard.",
    });
  };

  const words = seedPhrase.split(" ");

  return (
    <Card
      className="p-6 md:p-8 border  border-accent-foreground/20 cursor-pointer hover:bg-accent/50 transition-colors group"
      onClick={handleCopy}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold font-mono">
            Your Secret Phrase
          </h3>
          <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {words.map((word, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-muted/50 rounded-md font-mono text-sm"
            >
              <span className="text-xs text-muted-foreground font-mono">
                {index + 1}.
              </span>
              <span className="font-medium">{word}</span>
            </div>
          ))}
        </div>

        <p className="text-end mr-2 text-xs text-muted-foreground mt-6">
          Click Anywhere To Copy
        </p>
      </div>
    </Card>
  );
}
