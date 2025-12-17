/**
 * @fileoverview Server action for Solana devnet airdrop.
 *
 * @module actions/airdrop
 */

"use server";

import { MAX_AIRDROP_AMOUNT, MIN_AIRDROP_AMOUNT } from "@/lib/constants";
import type { AirdropResult } from "@/types";
import { Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from "@solana/web3.js";

// ============================================================================
// Configuration
// ============================================================================

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// ============================================================================
// Server Action
// ============================================================================

/**
 * Request SOL airdrop on Solana devnet.
 *
 * @param publicKey - Solana public key (base58)
 * @param amount - Amount of SOL to airdrop (0.1-2)
 * @returns Result with signature on success or error message on failure
 *
 * @example
 * ```tsx
 * const result = await requestAirdrop(wallet.publicKey, 1);
 * if (result.success) {
 *   console.log("Airdrop signature:", result.signature);
 * }
 * ```
 */
export async function requestAirdrop(publicKey: string, amount: number): Promise<AirdropResult> {
  // Validate public key
  if (!publicKey || typeof publicKey !== "string") {
    return { success: false, error: "Invalid public key" };
  }

  // Validate amount
  if (
    typeof amount !== "number" ||
    Number.isNaN(amount) ||
    amount < MIN_AIRDROP_AMOUNT ||
    amount > MAX_AIRDROP_AMOUNT
  ) {
    return {
      success: false,
      error: `Amount must be between ${MIN_AIRDROP_AMOUNT} and ${MAX_AIRDROP_AMOUNT} SOL`,
    };
  }

  try {
    const pubkey = new PublicKey(publicKey);
    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

    // Request airdrop
    const signature = await connection.requestAirdrop(pubkey, lamports);

    // Wait for confirmation
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature,
    });

    return { success: true, signature };
  } catch (error) {
    console.error("Airdrop failed:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    // Provide user-friendly error messages
    if (errorMessage.includes("rate limit")) {
      return {
        success: false,
        error: "Rate limit exceeded. Please wait a few minutes and try again.",
      };
    }

    return { success: false, error: errorMessage };
  }
}
