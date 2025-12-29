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
import { useAccount, useWalletClient, useChainId } from "wagmi";
import { walletClientToSigner, getVaultioContract, getTokenDecimals } from "@/lib/ethers";
import { useVaultioEvents } from "@/hooks/useVaultioEvents";
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
  const chainId = useChainId();

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
    if (!address || !walletClient || !chainId) {
      setUserLocks([]);
      return;
    }

    setIsLoadingLocks(true);
    try {
      const signer = getSigner();
      const vaultioContract = getVaultioContract(signer, chainId);
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
  }, [address, walletClient, chainId, getSigner, tokenDecimals]);

  // Fetch locks when wallet connects or address changes
  useEffect(() => {
    if (isConnected && address && walletClient) {
      fetchUserLocks();
    } else {
      setUserLocks([]);
    }
  }, [isConnected, address, walletClient, fetchUserLocks]);

  /**
   * Event handlers for real-time updates
   * When events are emitted, automatically refresh the locks list
   * 
   * Note: This provides real-time updates via contract events.
   * Components may also manually call fetchUserLocks() as a fallback,
   * creating a robust dual-update system for better UX and reliability.
   */
  const handleTokenLocked = useCallback(() => {
    console.log("TokenLocked event detected - refreshing locks...");
    fetchUserLocks();
  }, [fetchUserLocks]);

  const handleTokenWithdrawn = useCallback(() => {
    console.log("TokenWithdrawn event detected - refreshing locks...");
    fetchUserLocks();
  }, [fetchUserLocks]);

  // Set up event listeners for real-time updates
  // Filters events by connected user address for efficient updates
  useVaultioEvents(handleTokenLocked, handleTokenWithdrawn, isConnected && !!address);

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
