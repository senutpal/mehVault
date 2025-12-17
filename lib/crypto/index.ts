/**
 * @fileoverview Crypto module barrel export.
 * Provides unified access to encryption, wallet, and storage utilities.
 *
 * @module lib/crypto
 */

export {
  encrypt,
  decrypt,
  DecryptionError,
} from "./encryption";

export {
  generateSeedPhrase,
  isValidSeedPhrase,
  deriveWallet,
  deriveWallets,
} from "./wallet";

export {
  hasStoredVault,
  saveVault,
  loadVault,
  deleteStoredVault,
  createNewVault,
} from "./storage";
