"use client";

const PBKDF2_ITERATIONS = 1000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12; 
const ALGORITHM_NAME = "AES-GCM";
const HASH_NAME = "SHA-256";

export interface EncryptedData {
  ciphertext: string;
  salt: string;
  iv: string;
}

export type Blockchain = "solana" | "ethereum" | null;

export interface WalletData {
  id: number;
  publicKey: string;
  privateKey: string;
}

export interface VaultData {
  seedPhrase: string;
  blockchain: Blockchain;
  wallets: WalletData[];
}

export const STORAGE_KEY = "mehVault_secure_data";

const enc = new TextEncoder();
const dec = new TextDecoder();

const buff_to_base64 = (buff: Uint8Array): string =>
  btoa(String.fromCharCode.apply(null, Array.from(buff)));

const base64_to_buf = (b64: string): Uint8Array =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));


async function getPasswordKey(password: string) {
  return window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
}

async function deriveKey(passwordKey: CryptoKey, salt: Uint8Array) {
  const realSalt = new Uint8Array(salt).buffer as ArrayBuffer;
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: realSalt,
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_NAME,
    },
    passwordKey,
    { name: ALGORITHM_NAME, length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(
  secretData: string,
  password: string
): Promise<EncryptedData> {
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const passwordKey = await getPasswordKey(password);
  const aesKey = await deriveKey(passwordKey, salt);

  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM_NAME,
      iv: iv,
    },
    aesKey,
    enc.encode(secretData)
  );

  return {
    ciphertext: buff_to_base64(new Uint8Array(encryptedContent)),
    salt: buff_to_base64(salt),
    iv: buff_to_base64(iv),
  };
}

export async function decryptData(
  encryptedData: EncryptedData,
  password: string
): Promise<string> {
  try {
    const salt = base64_to_buf(encryptedData.salt);
    const iv = base64_to_buf(encryptedData.iv).buffer as ArrayBuffer;
    const ciphertext = base64_to_buf(encryptedData.ciphertext)
      .buffer as ArrayBuffer;

    const passwordKey = await getPasswordKey(password);
    const aesKey = await deriveKey(passwordKey, salt);
    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: ALGORITHM_NAME,
        iv: iv,
      },
      aesKey,
      ciphertext
    );

    return dec.decode(decryptedContent);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Incorrect password or corrupted data");
  }
}
