"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useAccount, useWalletClient } from "wagmi";
import { walletClientToSigner, getVaultioContract, getTokenDecimals } from "@/lib/ethers";
import type { Lock } from "@/types";

// Context state type - simplified to only data management
type VaultioContextState = {
  // Data
  userLocks: Lock[];
  isLoadingLocks: boolean;
  tokenDecimals: Record<string, number>;

  // Actions
  fetchUserLocks: () => Promise<void>;
  getDecimalsForToken: (tokenAddress: string) => number;
};

// Create context with default values
const VaultioContext = createContext<VaultioContextState | undefined>(undefined);

// Provider props
type VaultioProviderProps = {
  children: ReactNode;
};

export const VaultioProvider = ({ children }: VaultioProviderProps) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // State
  const [userLocks, setUserLocks] = useState<Lock[]>([]);
  const [isLoadingLocks, setIsLoadingLocks] = useState(false);
  const [tokenDecimals, setTokenDecimals] = useState<Record<string, number>>({});

  // Get signer from wallet client
  const getSigner = useCallback(() => {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }
    return walletClientToSigner(walletClient);
  }, [walletClient]);

  /**
   * Get decimals for a specific token from cache
   */
  const getDecimalsForToken = useCallback(
    (tokenAddress: string): number => {
      const normalizedAddress = tokenAddress.toLowerCase();
      return tokenDecimals[normalizedAddress] ?? 18;
    },
    [tokenDecimals]
  );

  /**
   * Fetch user locks from the contract
   */
  const fetchUserLocks = useCallback(async () => {
    if (!address || !walletClient) {
      setUserLocks([]);
      return;
    }

    setIsLoadingLocks(true);
    try {
      const signer = getSigner();
      const vaultioContract = getVaultioContract(signer);
      const locks = await vaultioContract.getUserLocks(address);

      // Convert the array of structs to our Lock type
      const formattedLocks: Lock[] = locks.map((lock: Lock) => ({
        token: lock.token,
        amount: lock.amount,
        startTime: lock.startTime,
        unlockTime: lock.unlockTime,
        withdrawn: lock.withdrawn,
      }));

      setUserLocks(formattedLocks);

      // Fetch decimals for all unique tokens in locks
      const uniqueTokens = [...new Set(formattedLocks.map((lock) => lock.token.toLowerCase()))];
      const decimalsToFetch = uniqueTokens.filter((token) => tokenDecimals[token] === undefined);

      if (decimalsToFetch.length > 0) {
        const decimalsPromises = decimalsToFetch.map(async (token) => {
          const decimals = await getTokenDecimals(token, signer);
          return { token, decimals };
        });

        const results = await Promise.all(decimalsPromises);
        const newDecimals: Record<string, number> = {};
        results.forEach(({ token, decimals }) => {
          newDecimals[token] = decimals;
        });

        setTokenDecimals((prev) => ({ ...prev, ...newDecimals }));
      }
    } catch (error) {
      console.error("Error fetching user locks:", error);
      setUserLocks([]);
    } finally {
      setIsLoadingLocks(false);
    }
  }, [address, walletClient, getSigner, tokenDecimals]);

  // Fetch locks when wallet connects or address changes
  useEffect(() => {
    if (isConnected && address && walletClient) {
      fetchUserLocks();
    } else {
      setUserLocks([]);
    }
  }, [isConnected, address, walletClient, fetchUserLocks]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<VaultioContextState>(
    () => ({
      userLocks,
      isLoadingLocks,
      tokenDecimals,
      fetchUserLocks,
      getDecimalsForToken,
    }),
    [userLocks, isLoadingLocks, tokenDecimals, fetchUserLocks, getDecimalsForToken]
  );

  return <VaultioContext.Provider value={value}>{children}</VaultioContext.Provider>;
};

/**
 * Hook to access the Vaultio context
 * For most use cases, prefer the specialized hooks:
 * - useUserLocks: For reading locks data
 * - useLockTokens: For locking tokens
 * - useWithdraw: For withdrawing tokens
 */
export const useVaultioContext = (): VaultioContextState => {
  const context = useContext(VaultioContext);

  if (context === undefined) {
    throw new Error("useVaultioContext must be used within a VaultioProvider");
  }

  return context;
};
