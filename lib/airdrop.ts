"use server";

import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));

export async function airdropSol(publicKey: string, solAmount: number) {
  try {
    if (!publicKey || typeof publicKey !== "string") {
      return { success: false, error: "Invalid public key" };
    }
    if (
      typeof solAmount !== "number" ||
      isNaN(solAmount) ||
      solAmount <= 0 ||
      solAmount > 5
    ) {
      return { success: false, error: "Amount must be between 0 and 2 SOL" };
    }
    
    const pubkey = new PublicKey(publicKey);
    const lamports = solAmount * LAMPORTS_PER_SOL;
    const signature = await connection.requestAirdrop(pubkey, lamports);
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    });
    return {
      success: true,
      signature,
    };
  } catch (error) {
    console.error("Airdrop Failed", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
