import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Signer,
} from "@solana/web3.js";
import {
  createMint,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const connection = new Connection(clusterApiUrl("devnet"));

export async function createMintForToken(
  payer: Signer,
  mintAuthority: PublicKey
): Promise<PublicKey> {
  const mint = await createMint(
    connection,
    payer,
    mintAuthority,
    null,
    6,
    undefined,
    undefined,
    TOKEN_PROGRAM_ID
  );
  return mint;
}

export async function mintNewTokens(
  payer: Signer,
  mint: PublicKey,
  to: PublicKey,
  amount: number
) {
  console.log("payer", payer);
  console.log("mint", mint);
  console.log("to", to);
  console.log("amount", amount);
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    to
  );
  await mintTo(connection, payer, mint, tokenAccount.address, payer, amount);
}

export async function getNativeBalance(
  connection: Connection,
  walletAddress: PublicKey
): Promise<number> {
  const balanceLamports = await connection.getBalance(walletAddress);
  const balanceSOL = balanceLamports / LAMPORTS_PER_SOL;
  return balanceSOL;
}

export async function getTokenBalance(
  connection: Connection,
  walletAddress: PublicKey,
  mintAddress: PublicKey
): Promise<{ amount: number; uiAmount: number; decimals: number }> {
  const tokenAccountAddress = await getAssociatedTokenAddress(
    mintAddress,
    walletAddress
  );

  try {
    const tokenBalance = await connection.getTokenAccountBalance(
      tokenAccountAddress
    );
    return {
      amount: Number(tokenBalance.value.amount),
      uiAmount: tokenBalance.value.uiAmount || 0,
      decimals: tokenBalance.value.decimals,
    };
  } catch (error) {
    console.log(error);
    return {
      amount: 0,
      uiAmount: 0,
      decimals: 0,
    };
  }
}
