/**
 * @fileoverview Wallets page for managing generated wallets.
 *
 * @module app/(onboarding)/wallets/page
 */

"use client";

import { Button } from "@/components/ui/button";
import { WalletList } from "@/components/wallet";
import { useWallet } from "@/providers";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Wallets page for generating and viewing HD wallets.
 * Redirects to home if no wallet data exists.
 */
export default function WalletsPage() {
  const router = useRouter();
  const { data, hasData, isLoading } = useWallet();

  // Guard: Must have wallet data
  useEffect(() => {
    if (!isLoading && !hasData) {
      router.replace("/");
    }
  }, [isLoading, hasData, router]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WalletList seedPhrase={data.seedPhrase} />

      <Button asChild className="w-full h-12 font-medium">
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
