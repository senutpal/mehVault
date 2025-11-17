/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  encryptData,
  decryptData,
  STORAGE_KEY,
  type VaultData,
  type EncryptedData,
  type WalletData,
  type Blockchain,
} from "@/lib/crypto";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface VaultContextType {
  vault: VaultData | null;
  isUnlocked: boolean;
  hasVault: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  createVault: (
    password: string,
    seedPhrase: string,
    blockchain: Blockchain
  ) => Promise<boolean>;
  addWallet: (newWallet: WalletData) => Promise<void>;
  clearWallets: () => Promise<void>;
  getWalletByPublicKey: (publicKey: string) => WalletData | undefined;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [vault, setVault] = useState<VaultData | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasVault, setHasVault] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    setHasVault(!!storedData);
    setIsLoading(false);
  }, []);

  const login = async (password: string): Promise<boolean> => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      toast.error("No vault found. Please create one.");
      return false;
    }

    try {
      const encrypted: EncryptedData = JSON.parse(storedData);
      const jsonString = await decryptData(encrypted, password);
      const data: VaultData = JSON.parse(jsonString);

      setVault(data);
      setPassword(password);
      setIsUnlocked(true);
      toast.success("Vault Unlocked");
      return true;
    } catch {
      toast.error("Incorrect password");
      return false;
    }
  };

  const createVault = async (
    password: string,
    seedPhrase: string,
    blockchain: Blockchain
  ): Promise<boolean> => {
    try {
      const newVault: VaultData = {
        seedPhrase,
        blockchain,
        wallets: [],
      };
      const encrypted = await encryptData(JSON.stringify(newVault), password);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));

      setVault(newVault);
      setPassword(password);
      setIsUnlocked(true);
      setHasVault(true);
      toast.success("Vault Created Successfully");
      return true;
    } catch {
      toast.error("Failed to create vault");
      return false;
    }
  };

  const logout = () => {
    setVault(null);
    setPassword(null);
    setIsUnlocked(false);
    router.push("/");
  };

  const saveCurrentVault = async (updatedVault: VaultData) => {
    if (!password) {
      toast.error("Session expired. Please log in again.");
      logout();
      return;
    }
    try {
      const encrypted = await encryptData(
        JSON.stringify(updatedVault),
        password
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
      setVault(updatedVault);
    } catch {
      toast.error("Failed to save wallet data");
    }
  };

  const addWallet = async (newWallet: WalletData) => {
    if (!vault) return;
    const updatedVault = {
      ...vault,
      wallets: [...vault.wallets, newWallet],
    };
    await saveCurrentVault(updatedVault);
    toast.success("Wallet Added");
  };

  const clearWallets = async () => {
    if (!vault) return;
    const updatedVault = {
      ...vault,
      wallets: [],
    };
    await saveCurrentVault(updatedVault);
    toast.warning("Wallets Cleared");
  };

  const getWalletByPublicKey = (publicKey: string): WalletData | undefined => {
    return vault?.wallets.find((w) => w.publicKey === publicKey);
  };

  return (
    <VaultContext.Provider
      value={{
        vault,
        isUnlocked,
        hasVault,
        isLoading,
        login,
        logout,
        createVault,
        addWallet,
        clearWallets,
        getWalletByPublicKey,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
}
