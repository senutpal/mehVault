/**
 * @fileoverview Vault context provider for secure wallet state management.
 * Provides encrypted vault access throughout the application with
 * proper state management and persistence.
 *
 * @module providers/vault-provider
 */

"use client";

import {
  DecryptionError,
  createNewVault,
  deleteStoredVault,
  hasStoredVault,
  loadVault,
  saveVault,
} from "@/lib/crypto";
import type { Blockchain, VaultContextType, VaultData, Wallet } from "@/types";
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
// Context Definition
// ============================================================================

const VaultContext = createContext<VaultContextType | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

interface VaultProviderProps {
  children: ReactNode;
}

/**
 * Vault context provider component.
 * Manages encrypted vault state and provides CRUD operations.
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * <VaultProvider>
 *   {children}
 * </VaultProvider>
 *
 * // In component
 * const { vault, unlock, lock } = useVault();
 * ```
 */
export function VaultProvider({ children }: VaultProviderProps) {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  const [vault, setVault] = useState<VaultData | null>(null);
  const [hasVault, setHasVault] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Store password in memory for re-encryption on updates
  // This is cleared when vault is locked
  const [password, setPassword] = useState<string | null>(null);

  // Derived state
  const isUnlocked = vault !== null && password !== null;

  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------

  useEffect(() => {
    // Check for existing vault on mount
    const checkVault = () => {
      const exists = hasStoredVault();
      setHasVault(exists);
      setIsLoading(false);
    };

    checkVault();
  }, []);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  /**
   * Unlock vault with password.
   */
  const unlock = useCallback(async (userPassword: string): Promise<boolean> => {
    try {
      const vaultData = await loadVault(userPassword);
      setVault(vaultData);
      setPassword(userPassword);
      toast.success("Vault unlocked");
      return true;
    } catch (error) {
      if (error instanceof DecryptionError) {
        toast.error("Incorrect password");
      } else {
        toast.error("Failed to unlock vault");
        console.error("Unlock error:", error);
      }
      return false;
    }
  }, []);

  /**
   * Lock vault and clear sensitive data.
   */
  const lock = useCallback(() => {
    setVault(null);
    setPassword(null);
    toast.success("Vault locked");
  }, []);

  /**
   * Create new vault.
   */
  const createVault = useCallback(
    async (userPassword: string, seedPhrase: string, blockchain: Blockchain): Promise<boolean> => {
      try {
        const vaultData = await createNewVault(userPassword, seedPhrase, blockchain);
        setVault(vaultData);
        setPassword(userPassword);
        setHasVault(true);
        toast.success("Vault created successfully");
        return true;
      } catch (error) {
        toast.error("Failed to create vault");
        console.error("Create vault error:", error);
        return false;
      }
    },
    []
  );

  /**
   * Add wallet to vault.
   */
  const addWallet = useCallback(
    async (wallet: Wallet): Promise<void> => {
      if (!vault || !password) {
        toast.error("Vault is locked");
        return;
      }

      const updatedVault: VaultData = {
        ...vault,
        wallets: [...vault.wallets, wallet],
        updatedAt: Date.now(),
      };

      try {
        await saveVault(updatedVault, password);
        setVault(updatedVault);
        toast.success(`Wallet ${wallet.id} added`);
      } catch (error) {
        toast.error("Failed to save wallet");
        console.error("Add wallet error:", error);
      }
    },
    [vault, password]
  );

  /**
   * Clear all wallets from vault.
   */
  const clearWallets = useCallback(async (): Promise<void> => {
    if (!vault || !password) {
      toast.error("Vault is locked");
      return;
    }

    const updatedVault: VaultData = {
      ...vault,
      wallets: [],
      updatedAt: Date.now(),
    };

    try {
      await saveVault(updatedVault, password);
      setVault(updatedVault);
      toast.warning("All wallets cleared");
    } catch (error) {
      toast.error("Failed to clear wallets");
      console.error("Clear wallets error:", error);
    }
  }, [vault, password]);

  /**
   * Delete vault completely.
   */
  const deleteVault = useCallback(() => {
    deleteStoredVault();
    setVault(null);
    setPassword(null);
    setHasVault(false);
    toast.success("Vault deleted");
  }, []);

  // -------------------------------------------------------------------------
  // Context Value
  // -------------------------------------------------------------------------

  const contextValue = useMemo<VaultContextType>(
    () => ({
      // State
      vault,
      isUnlocked,
      hasVault,
      isLoading,
      // Actions
      unlock,
      lock,
      createVault,
      addWallet,
      clearWallets,
      deleteVault,
    }),
    [
      vault,
      isUnlocked,
      hasVault,
      isLoading,
      unlock,
      lock,
      createVault,
      addWallet,
      clearWallets,
      deleteVault,
    ]
  );

  return <VaultContext.Provider value={contextValue}>{children}</VaultContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Access vault context from any component.
 *
 * @returns Vault state and actions
 * @throws {Error} If used outside of VaultProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { vault, isUnlocked, unlock, lock } = useVault();
 *
 *   if (!isUnlocked) {
 *     return <LoginForm onSubmit={unlock} />;
 *   }
 *
 *   return <WalletList wallets={vault.wallets} />;
 * }
 * ```
 */
export function useVault(): VaultContextType {
  const context = useContext(VaultContext);

  if (!context) {
    throw new Error("useVault must be used within a VaultProvider");
  }

  return context;
}
