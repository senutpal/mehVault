/**
 * @fileoverview Entry page - Blockchain selection.
 * Start point of the application flow.
 *
 * @module app/(onboarding)/page
 */

"use client";

import { BlockchainSelector } from "@/components/blockchain";
import { useWallet } from "@/providers";
import type { Blockchain } from "@/types";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

/**
 * Entry page - Blockchain selection.
 * If user already has wallet data, redirect to wallets page.
 */
export default function HomePage() {
  const router = useRouter();
  const { data, hasData, isLoading } = useWallet();

  // Redirect if already has wallet data
  useEffect(() => {
    if (!isLoading && hasData && data && data.wallets.length > 0) {
      router.replace("/wallets");
    }
  }, [isLoading, hasData, data, router]);

  /**
   * Handle blockchain selection.
   */
  const handleSelect = useCallback(
    (blockchain: Blockchain) => {
      // Store selection in session and navigate to seed phrase
      sessionStorage.setItem("_selectedBlockchain", blockchain);
      toast.success(`${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)} selected`);
      router.push("/seed");
    },
    [router]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <BlockchainSelector onSelect={handleSelect} />;
}
