/**
 * @fileoverview Custom hook for wallet generation operations.
 *
 * @module hooks/use-wallet-generation
 */

"use client";

import { deriveWallet } from "@/lib/crypto";
import { useWallet } from "@/providers";
import type { Blockchain, Wallet } from "@/types";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface UseWalletGenerationResult {
  /** Generate and add a new wallet */
  generateWallet: () => Promise<Wallet | null>;
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Error from last generation attempt */
  error: string | null;
}

/**
 * Custom hook for generating HD wallets.
 * Handles derivation, wallet integration, and error states.
 *
 * @param seedPhrase - BIP39 seed phrase for derivation
 * @param blockchain - Target blockchain network
 * @returns Wallet generation utilities
 */
export function useWalletGeneration(
  seedPhrase: string,
  blockchain: Blockchain
): UseWalletGenerationResult {
  const { data, addWallet } = useWallet();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWallet = useCallback(async (): Promise<Wallet | null> => {
    if (!data) {
      setError("No wallet data");
      toast.error("No wallet data");
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Derive wallet at next index
      const nextIndex = data.wallets.length;
      const wallet = deriveWallet(seedPhrase, blockchain, nextIndex);

      // Add to wallet data
      addWallet(wallet);

      return wallet;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate wallet";
      setError(message);
      toast.error("Failed to generate wallet", { description: message });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [data, seedPhrase, blockchain, addWallet]);

  return {
    generateWallet,
    isGenerating,
    error,
  };
}
