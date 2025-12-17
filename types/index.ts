/**
 * @fileoverview Core type definitions for the mehVault application.
 * These types define the data structures used throughout the application
 * for blockchain wallet management, encryption, and vault operations.
 *
 * @module types
 */

// ============================================================================
// Blockchain Types
// ============================================================================

/**
 * Supported blockchain networks.
 * Each blockchain has different key derivation paths and address formats.
 */
export type Blockchain = "solana" | "ethereum";

/**
 * Blockchain configuration including derivation paths and display info.
 */
export interface BlockchainConfig {
  /** Unique identifier for the blockchain */
  id: Blockchain;
  /** Human-readable display name */
  name: string;
  /** BIP44 coin type for derivation path */
  coinType: number;
  /** Address prefix pattern for validation */
  addressPrefix: string;
}

// ============================================================================
// Wallet Types
// ============================================================================

/**
 * Individual wallet data structure containing keys and metadata.
 * Private keys are stored encrypted at rest.
 */
export interface Wallet {
  /** Unique wallet identifier (1-indexed, sequential) */
  id: number;
  /** Public key/address for receiving funds */
  publicKey: string;
  /** Private key for signing transactions (hex-encoded) */
  privateKey: string;
  /** Wallet creation timestamp */
  createdAt: number;
}

/**
 * Minimal wallet data for display purposes (no private key).
 */
export type WalletPublicInfo = Pick<Wallet, "id" | "publicKey" | "createdAt">;

// ============================================================================
// Vault Types
// ============================================================================

/**
 * Complete vault data stored encrypted in localStorage.
 * This is the decrypted form of the vault contents.
 */
export interface VaultData {
  /** BIP39 mnemonic seed phrase (12 or 24 words) */
  seedPhrase: string;
  /** Selected blockchain network for all wallets */
  blockchain: Blockchain;
  /** Array of generated HD wallets */
  wallets: Wallet[];
  /** Vault creation timestamp */
  createdAt: number;
  /** Last modification timestamp */
  updatedAt: number;
}

/**
 * Encrypted data structure stored in localStorage.
 * Uses AES-256-GCM encryption with PBKDF2 key derivation.
 */
export interface EncryptedVault {
  /** Base64-encoded AES-GCM ciphertext */
  ciphertext: string;
  /** Base64-encoded random salt for PBKDF2 (16 bytes) */
  salt: string;
  /** Base64-encoded initialization vector for AES-GCM (12 bytes) */
  iv: string;
  /** Schema version for future migrations */
  version: number;
}

// ============================================================================
// Vault Context Types
// ============================================================================

/**
 * Vault state exposed through React context.
 */
export interface VaultState {
  /** Decrypted vault data (null when locked) */
  vault: VaultData | null;
  /** Whether the vault is currently unlocked */
  isUnlocked: boolean;
  /** Whether a vault exists in storage */
  hasVault: boolean;
  /** Loading state during async operations */
  isLoading: boolean;
}

/**
 * Vault actions available through React context.
 */
export interface VaultActions {
  /**
   * Unlock an existing vault with password.
   * @param password - User's vault password
   * @returns true if unlock successful, false otherwise
   */
  unlock: (password: string) => Promise<boolean>;

  /**
   * Lock the vault and clear sensitive data from memory.
   */
  lock: () => void;

  /**
   * Create a new vault with initial configuration.
   * @param password - Password for vault encryption
   * @param seedPhrase - BIP39 mnemonic seed phrase
   * @param blockchain - Target blockchain network
   * @returns true if creation successful, false otherwise
   */
  createVault: (password: string, seedPhrase: string, blockchain: Blockchain) => Promise<boolean>;

  /**
   * Add a new wallet to the vault.
   * @param wallet - Wallet data to add
   */
  addWallet: (wallet: Wallet) => Promise<void>;

  /**
   * Remove all wallets from the vault.
   */
  clearWallets: () => Promise<void>;

  /**
   * Delete the vault completely from storage.
   */
  deleteVault: () => void;
}

/**
 * Complete vault context combining state and actions.
 */
export type VaultContextType = VaultState & VaultActions;

// ============================================================================
// Application Flow Types
// ============================================================================

/**
 * Application step states for the main onboarding/usage flow.
 */
export type AppStep =
  | "auth" // Password entry/creation
  | "blockchain" // Blockchain selection
  | "seed" // Seed phrase generation/import
  | "wallet-view"; // Wallet management view

/**
 * Airdrop request result from server action.
 */
export type AirdropResult =
  | { success: true; signature: string }
  | { success: false; error: string };
