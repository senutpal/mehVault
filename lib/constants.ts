/**
 * @fileoverview Application-wide constants and configuration.
 * Centralized location for magic values and configuration.
 *
 * @module lib/constants
 */

// ============================================================================
// Storage Constants
// ============================================================================

/** LocalStorage key for encrypted vault data */
export const VAULT_STORAGE_KEY = "mehVault_encrypted_vault" as const;

/** Current vault schema version for migrations */
export const VAULT_SCHEMA_VERSION = 1 as const;

// ============================================================================
// Cryptography Constants
// ============================================================================

/**
 * PBKDF2 iteration count for key derivation.
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 */
export const PBKDF2_ITERATIONS = 100_000 as const;

/** Salt length in bytes for PBKDF2 */
export const SALT_LENGTH = 16 as const;

/** IV length in bytes for AES-GCM */
export const IV_LENGTH = 12 as const;

/** AES key length in bits */
export const AES_KEY_LENGTH = 256 as const;

// ============================================================================
// Blockchain Constants
// ============================================================================

import type { BlockchainConfig } from "@/types";

/**
 * Blockchain configuration map with derivation paths and metadata.
 */
export const BLOCKCHAIN_CONFIGS: Record<string, BlockchainConfig> = {
  solana: {
    id: "solana",
    name: "Solana",
    coinType: 501,
    addressPrefix: "",
  },
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    coinType: 60,
    addressPrefix: "0x",
  },
} as const;

/**
 * Generate BIP44 derivation path for a blockchain and wallet index.
 * @param blockchain - Target blockchain
 * @param index - Wallet index (0-based)
 * @returns Full derivation path string
 */
export function getDerivationPath(blockchain: string, index: number): string {
  const config = BLOCKCHAIN_CONFIGS[blockchain];
  if (!config) {
    throw new Error(`Unsupported blockchain: ${blockchain}`);
  }

  // Solana uses hardened derivation: m/44'/501'/index'/0'
  // Ethereum uses: m/44'/60'/0'/0/index
  if (blockchain === "solana") {
    return `m/44'/${config.coinType}'/${index}'/0'`;
  }
  return `m/44'/${config.coinType}'/0'/0/${index}`;
}

// ============================================================================
// Validation Constants
// ============================================================================

/** Minimum password length requirement */
export const MIN_PASSWORD_LENGTH = 8 as const;

/** Maximum airdrop amount in SOL (devnet limit) */
export const MAX_AIRDROP_AMOUNT = 2 as const;

/** Minimum airdrop amount in SOL */
export const MIN_AIRDROP_AMOUNT = 0.1 as const;

// ============================================================================
// UI Constants
// ============================================================================

/** Toast notification duration in milliseconds */
export const TOAST_DURATION = 4000 as const;

/** Debounce delay for input validation in milliseconds */
export const DEBOUNCE_DELAY = 300 as const;
