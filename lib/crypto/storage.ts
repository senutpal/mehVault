/**
 * @fileoverview Vault storage operations.
 * Handles encrypted vault persistence to localStorage.
 *
 * @module lib/crypto/storage
 */

import { VAULT_SCHEMA_VERSION, VAULT_STORAGE_KEY } from "@/lib/constants";
import type { EncryptedVault, VaultData } from "@/types";
import { DecryptionError, decrypt, encrypt } from "./encryption";

// ============================================================================
// Storage Operations
// ============================================================================

/**
 * Check if a vault exists in storage.
 *
 * @returns true if vault data exists in localStorage
 */
export function hasStoredVault(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(VAULT_STORAGE_KEY) !== null;
}

/**
 * Save vault data to encrypted storage.
 *
 * @param vaultData - Vault data to save
 * @param password - Password for encryption
 * @throws {Error} If encryption or storage fails
 *
 * @example
 * ```ts
 * await saveVault(vaultData, userPassword);
 * ```
 */
export async function saveVault(vaultData: VaultData, password: string): Promise<void> {
  const dataWithTimestamp: VaultData = {
    ...vaultData,
    updatedAt: Date.now(),
  };

  const encrypted = await encrypt(
    JSON.stringify(dataWithTimestamp),
    password,
    VAULT_SCHEMA_VERSION
  );

  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(encrypted));
}

/**
 * Load and decrypt vault data from storage.
 *
 * @param password - Password for decryption
 * @returns Decrypted vault data
 * @throws {DecryptionError} If password is incorrect
 * @throws {Error} If no vault exists or data is corrupted
 *
 * @example
 * ```ts
 * try {
 *   const vault = await loadVault(userPassword);
 * } catch (error) {
 *   if (error instanceof DecryptionError) {
 *     showError("Incorrect password");
 *   }
 * }
 * ```
 */
export async function loadVault(password: string): Promise<VaultData> {
  const stored = localStorage.getItem(VAULT_STORAGE_KEY);

  if (!stored) {
    throw new Error("No vault found in storage");
  }

  let encrypted: EncryptedVault;
  try {
    encrypted = JSON.parse(stored) as EncryptedVault;
  } catch {
    throw new Error("Corrupted vault data in storage");
  }

  const decrypted = await decrypt(encrypted, password);
  return JSON.parse(decrypted) as VaultData;
}

/**
 * Delete vault from storage completely.
 * This action is irreversible.
 */
export function deleteStoredVault(): void {
  localStorage.removeItem(VAULT_STORAGE_KEY);
}

/**
 * Create a new vault with initial configuration.
 *
 * @param password - Password for encryption
 * @param seedPhrase - BIP39 seed phrase
 * @param blockchain - Selected blockchain
 * @returns Created vault data
 *
 * @example
 * ```ts
 * const vault = await createNewVault(password, seedPhrase, "solana");
 * ```
 */
export async function createNewVault(
  password: string,
  seedPhrase: string,
  blockchain: VaultData["blockchain"]
): Promise<VaultData> {
  const now = Date.now();

  const vaultData: VaultData = {
    seedPhrase,
    blockchain,
    wallets: [],
    createdAt: now,
    updatedAt: now,
  };

  await saveVault(vaultData, password);
  return vaultData;
}

// Re-export DecryptionError for consumers
export { DecryptionError };
