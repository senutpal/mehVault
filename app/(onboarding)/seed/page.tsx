/**
 * @fileoverview Seed phrase generation/import page.
 * Creates wallet data and redirects to wallet generation.
 *
 * @module app/(onboarding)/seed/page
 */

"use client";

import { SeedPhraseInput } from "@/components/seed-phrase";
import { useWallet } from "@/providers";
import type { Blockchain } from "@/types";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Seed phrase page for wallet recovery phrase generation or import.
 * Creates wallet data on confirmation and redirects to wallet generation.
 */
export default function SeedPage() {
  const router = useRouter();
  const { createWallet, hasData, data, isLoading } = useWallet();
  const [blockchain, setBlockchain] = useState<Blockchain | null>(null);

  // Get blockchain from session storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const chain = sessionStorage.getItem("_selectedBlockchain") as Blockchain | null;
      setBlockchain(chain);
    }
  }, []);

  // Guard: Must have blockchain selected
  useEffect(() => {
    if (!isLoading && !blockchain && typeof window !== "undefined") {
      const chain = sessionStorage.getItem("_selectedBlockchain") as Blockchain | null;
      if (!chain) {
        router.replace("/");
      }
    }
  }, [isLoading, blockchain, router]);

  // If already has wallets, redirect
  useEffect(() => {
    if (hasData && data && data.wallets.length > 0) {
      router.replace("/wallets");
    }
  }, [hasData, data, router]);

  /**
   * Handle seed phrase confirmation.
   */
  const handleConfirm = useCallback(
    (seedPhrase: string) => {
      if (!blockchain) {
        toast.error("Please select a blockchain first.");
        router.replace("/");
        return;
      }

      // Create wallet data
      createWallet(seedPhrase, blockchain);

      // Clear session storage
      sessionStorage.removeItem("_selectedBlockchain");

      // Navigate to wallets
      router.push("/wallets");
    },
    [blockchain, createWallet, router]
  );

  /**
   * Handle back navigation.
   */
  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Wait for blockchain to load from session
  if (!blockchain) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <SeedPhraseInput blockchain={blockchain} onConfirm={handleConfirm} onBack={handleBack} />;
}
