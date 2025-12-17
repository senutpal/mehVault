/**
 * @fileoverview HD wallet key derivation utilities.
 * Supports BIP39 mnemonic phrases and BIP44 derivation paths
 * for Solana and Ethereum blockchains.
 *
 * @module lib/crypto/wallet
 */

import { getDerivationPath } from "@/lib/constants";
import type { Blockchain, Wallet } from "@/types";
import { Keypair } from "@solana/web3.js";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { HDNodeWallet } from "ethers";
import { sign } from "tweetnacl";

// ============================================================================
// Seed Phrase Utilities
// ============================================================================

/**
 * Generate a new BIP39 mnemonic seed phrase.
 *
 * @param strength - Entropy strength in bits (128 = 12 words, 256 = 24 words)
 * @returns Generated mnemonic phrase
 *
 * @example
 * ```ts
 * const phrase = generateSeedPhrase(); // 12-word phrase
 * const phrase24 = generateSeedPhrase(256); // 24-word phrase
 * ```
 */
export function generateSeedPhrase(strength: 128 | 256 = 128): string {
  return generateMnemonic(strength);
}

/**
 * Validate a BIP39 mnemonic seed phrase.
 *
 * @param phrase - Mnemonic phrase to validate
 * @returns true if valid BIP39 phrase, false otherwise
 *
 * @example
 * ```ts
 * if (isValidSeedPhrase(userInput)) {
 *   // Safe to use for wallet derivation
 * }
 * ```
 */
export function isValidSeedPhrase(phrase: string): boolean {
  return validateMnemonic(phrase.trim().toLowerCase());
}

// ============================================================================
// Wallet Derivation
// ============================================================================

/**
 * Derive a Solana keypair from seed phrase and index.
 *
 * Uses BIP44 path: m/44'/501'/index'/0'
 * Derives ed25519 keypair using SLIP-0010.
 *
 * @param seedPhrase - BIP39 mnemonic phrase
 * @param index - Wallet index (0-based)
 * @returns Object with public and private key in appropriate formats
 */
function deriveSolanaWallet(
  seedPhrase: string,
  index: number
): { publicKey: string; privateKey: string } {
  const path = getDerivationPath("solana", index);
  const seed = mnemonicToSeedSync(seedPhrase);
  const { key: derivedSeed } = derivePath(path, seed.toString("hex"));

  const keypair = sign.keyPair.fromSeed(derivedSeed);
  const solanaKeypair = Keypair.fromSecretKey(keypair.secretKey);

  return {
    publicKey: solanaKeypair.publicKey.toBase58(),
    privateKey: Buffer.from(solanaKeypair.secretKey).toString("hex"),
  };
}

/**
 * Derive an Ethereum wallet from seed phrase and index.
 *
 * Uses BIP44 path: m/44'/60'/0'/0/index
 * Derives secp256k1 keypair using standard BIP32.
 *
 * @param seedPhrase - BIP39 mnemonic phrase
 * @param index - Wallet index (0-based)
 * @returns Object with public address and private key
 */
function deriveEthereumWallet(
  seedPhrase: string,
  index: number
): { publicKey: string; privateKey: string } {
  const path = getDerivationPath("ethereum", index);
  const wallet = HDNodeWallet.fromPhrase(seedPhrase, undefined, path);

  return {
    publicKey: wallet.address,
    privateKey: wallet.privateKey,
  };
}

/**
 * Derive a wallet from seed phrase for the specified blockchain.
 *
 * This is the main entry point for wallet derivation. It handles
 * blockchain-specific derivation paths and key formats.
 *
 * @param seedPhrase - BIP39 mnemonic phrase
 * @param blockchain - Target blockchain network
 * @param index - Wallet index (0-based)
 * @returns Complete wallet object with keys and metadata
 * @throws {Error} If seed phrase is invalid or blockchain unsupported
 *
 * @example
 * ```ts
 * const wallet = deriveWallet(seedPhrase, "solana", 0);
 * console.log(wallet.publicKey); // Base58 address
 *
 * const ethWallet = deriveWallet(seedPhrase, "ethereum", 0);
 * console.log(ethWallet.publicKey); // 0x... address
 * ```
 */
export function deriveWallet(seedPhrase: string, blockchain: Blockchain, index: number): Wallet {
  // Validate seed phrase first
  if (!isValidSeedPhrase(seedPhrase)) {
    throw new Error("Invalid BIP39 seed phrase");
  }

  let keys: { publicKey: string; privateKey: string };

  switch (blockchain) {
    case "solana":
      keys = deriveSolanaWallet(seedPhrase, index);
      break;
    case "ethereum":
      keys = deriveEthereumWallet(seedPhrase, index);
      break;
    default:
      throw new Error(`Unsupported blockchain: ${blockchain}`);
  }

  return {
    id: index + 1, // 1-indexed for display
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
    createdAt: Date.now(),
  };
}

/**
 * Derive multiple wallets in sequence.
 *
 * @param seedPhrase - BIP39 mnemonic phrase
 * @param blockchain - Target blockchain network
 * @param count - Number of wallets to derive
 * @param startIndex - Starting index (default 0)
 * @returns Array of derived wallets
 *
 * @example
 * ```ts
 * const wallets = deriveWallets(seedPhrase, "ethereum", 5);
 * // Returns wallets with indices 0-4
 * ```
 */
export function deriveWallets(
  seedPhrase: string,
  blockchain: Blockchain,
  count: number,
  startIndex = 0
): Wallet[] {
  return Array.from({ length: count }, (_, i) =>
    deriveWallet(seedPhrase, blockchain, startIndex + i)
  );
}
