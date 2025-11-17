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
    console.log(error);
    return {
      success: false,
    };
  }
}
