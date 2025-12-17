/**
 * @fileoverview Simple wallet context provider (no encryption).
 * Provides wallet state management throughout the application.
 *
 * @module providers/wallet-provider
 */

"use client";

import { VAULT_STORAGE_KEY } from "@/lib/constants";
import type { Blockchain, Wallet } from "@/types";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

export interface WalletData {
  /** BIP39 mnemonic seed phrase (12 or 24 words) */
  seedPhrase: string;
  /** Selected blockchain network for all wallets */
  blockchain: Blockchain;
  /** Array of generated HD wallets */
  wallets: Wallet[];
  /** Creation timestamp */
  createdAt: number;
  /** Last modification timestamp */
  updatedAt: number;
}

export interface WalletContextType {
  /** Wallet data (null if not created) */
  data: WalletData | null;
  /** Whether wallet data exists */
  hasData: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Create new wallet data */
  createWallet: (seedPhrase: string, blockchain: Blockchain) => void;
  /** Add a wallet */
  addWallet: (wallet: Wallet) => void;
  /** Clear all wallets */
  clearWallets: () => void;
  /** Delete all data */
  deleteAll: () => void;
}

// ============================================================================
// Context
// ============================================================================

const WalletContext = createContext<WalletContextType | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface WalletProviderProps {
  children: ReactNode;
}

/**
 * Simple wallet provider without encryption.
 * Stores wallet data in localStorage directly.
 */
export function WalletProvider({ children }: WalletProviderProps) {
  const [data, setData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasData = data !== null;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(VAULT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WalletData;
        setData(parsed);
      }
    } catch (error) {
      console.error("Failed to load wallet data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever data changes
  const saveData = useCallback((newData: WalletData) => {
    setData(newData);
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(newData));
  }, []);

  /**
   * Create new wallet data.
   */
  const createWallet = useCallback(
    (seedPhrase: string, blockchain: Blockchain) => {
      const now = Date.now();
      const newData: WalletData = {
        seedPhrase,
        blockchain,
        wallets: [],
        createdAt: now,
        updatedAt: now,
      };
      saveData(newData);
      toast.success("Wallet created!");
    },
    [saveData]
  );

  /**
   * Add a wallet.
   */
  const addWallet = useCallback(
    (wallet: Wallet) => {
      if (!data) {
        toast.error("No wallet data");
        return;
      }

      const updated: WalletData = {
        ...data,
        wallets: [...data.wallets, wallet],
        updatedAt: Date.now(),
      };
      saveData(updated);
      toast.success(`Wallet ${wallet.id} added`);
    },
    [data, saveData]
  );

  /**
   * Clear all wallets.
   */
  const clearWallets = useCallback(() => {
    if (!data) return;

    const updated: WalletData = {
      ...data,
      wallets: [],
      updatedAt: Date.now(),
    };
    saveData(updated);
    toast.warning("All wallets cleared");
  }, [data, saveData]);

  /**
   * Delete all data.
   */
  const deleteAll = useCallback(() => {
    localStorage.removeItem(VAULT_STORAGE_KEY);
    setData(null);
    toast.success("All data deleted");
  }, []);

  // -------------------------------------------------------------------------
  // Context Value
  // -------------------------------------------------------------------------

  const contextValue = useMemo<WalletContextType>(
    () => ({
      data,
      hasData,
      isLoading,
      createWallet,
      addWallet,
      clearWallets,
      deleteAll,
    }),
    [data, hasData, isLoading, createWallet, addWallet, clearWallets, deleteAll]
  );

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Access wallet context.
 */
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }

  return context;
}
