/**
 * @fileoverview AES-256-GCM encryption utilities using Web Crypto API.
 * Provides secure encryption/decryption for vault data with PBKDF2 key derivation.
 *
 * @module lib/crypto/encryption
 */

import { AES_KEY_LENGTH, IV_LENGTH, PBKDF2_ITERATIONS, SALT_LENGTH } from "@/lib/constants";
import type { EncryptedVault } from "@/types";

// ============================================================================
// Internal Utilities
// ============================================================================

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/**
 * Convert Uint8Array to base64 string.
 */
function bufferToBase64(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer));
}

/**
 * Convert base64 string to Uint8Array.
 */
function base64ToBuffer(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

/**
 * Import password as CryptoKey for PBKDF2.
 */
async function importPassword(password: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", textEncoder.encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);
}

/**
 * Derive AES-GCM key from password using PBKDF2.
 */
async function deriveKey(passwordKey: CryptoKey, salt: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Encrypts plaintext data using AES-256-GCM with PBKDF2 key derivation.
 *
 * Security considerations:
 * - Uses 100,000 PBKDF2 iterations (OWASP recommended minimum)
 * - Random 16-byte salt prevents rainbow table attacks
 * - Random 12-byte IV ensures unique ciphertext for identical plaintexts
 * - AES-GCM provides authenticated encryption (integrity + confidentiality)
 *
 * @param plaintext - Data to encrypt (typically JSON string)
 * @param password - User password for key derivation
 * @param version - Schema version for the encrypted data
 * @returns Encrypted data structure with salt, IV, and ciphertext
 * @throws {Error} If encryption fails due to Web Crypto API issues
 *
 * @example
 * ```ts
 * const encrypted = await encrypt(JSON.stringify(vaultData), "user-password");
 * localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(encrypted));
 * ```
 */
export async function encrypt(
  plaintext: string,
  password: string,
  version = 1
): Promise<EncryptedVault> {
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive encryption key
  const passwordKey = await importPassword(password);
  const aesKey = await deriveKey(passwordKey, salt);

  // Encrypt data
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    textEncoder.encode(plaintext)
  );

  return {
    ciphertext: bufferToBase64(new Uint8Array(ciphertext)),
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    version,
  };
}

/**
 * Decrypts AES-256-GCM encrypted data.
 *
 * @param encrypted - Encrypted data structure
 * @param password - User password for key derivation
 * @returns Decrypted plaintext string
 * @throws {DecryptionError} If password is incorrect or data is corrupted
 *
 * @example
 * ```ts
 * const stored = localStorage.getItem(VAULT_STORAGE_KEY);
 * const encrypted = JSON.parse(stored) as EncryptedVault;
 * const plaintext = await decrypt(encrypted, "user-password");
 * const vaultData = JSON.parse(plaintext) as VaultData;
 * ```
 */
export async function decrypt(encrypted: EncryptedVault, password: string): Promise<string> {
  try {
    const salt = base64ToBuffer(encrypted.salt);
    const iv = base64ToBuffer(encrypted.iv);
    const ciphertext = base64ToBuffer(encrypted.ciphertext);

    // Derive decryption key
    const passwordKey = await importPassword(password);
    const aesKey = await deriveKey(passwordKey, salt);

    // Decrypt data
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      aesKey,
      ciphertext.buffer as ArrayBuffer
    );

    return textDecoder.decode(plaintext);
  } catch (error) {
    // AES-GCM will throw if password is wrong (authentication fails)
    throw new DecryptionError("Decryption failed: incorrect password or corrupted data", {
      cause: error,
    });
  }
}

/**
 * Custom error class for decryption failures.
 * Allows catching specifically decryption errors vs other errors.
 */
export class DecryptionError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DecryptionError";
  }
}
