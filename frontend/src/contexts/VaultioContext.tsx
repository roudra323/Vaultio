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
import { toast } from "sonner";
import {
  walletClientToSigner,
  getVaultioContract,
  getERC20Contract,
  parseTokenAmount,
  getTokenDecimals,
} from "@/lib/ethers";
import { formatTransactionError } from "@/lib/utils";
import { VAULTIO_ADDRESS } from "@/lib/contracts";
import type { ethers } from "ethers";

// Lock type using Ethers BigNumber
export type Lock = {
  token: string;
  amount: ethers.BigNumber;
  startTime: ethers.BigNumber;
  unlockTime: ethers.BigNumber;
  withdrawn: boolean;
};

// Context state type
type VaultioContextState = {
  // Data
  userLocks: Lock[];
  isLoadingLocks: boolean;
  tokenDecimals: Record<string, number>;

  // Transaction states
  isApproving: boolean;
  isLocking: boolean;
  isWithdrawing: boolean;

  // Actions
  fetchUserLocks: () => Promise<void>;
  getDecimals: (tokenAddress: string) => Promise<number>;
  checkAllowance: (tokenAddress: string, amount: string) => Promise<boolean>;
  approveTokens: (tokenAddress: string, amount: string) => Promise<boolean>;
  lockTokens: (tokenAddress: string, amount: string, durationInMinutes: number) => Promise<boolean>;
  withdrawTokens: (lockId: number) => Promise<boolean>;
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
  const [isApproving, setIsApproving] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [tokenDecimals, setTokenDecimals] = useState<Record<string, number>>({});

  // Get signer from wallet client
  const getSigner = useCallback(() => {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }
    return walletClientToSigner(walletClient);
  }, [walletClient]);

  // Get token decimals with caching
  const getDecimals = useCallback(
    async (tokenAddress: string): Promise<number> => {
      const normalizedAddress = tokenAddress.toLowerCase();

      // Check cache first
      if (tokenDecimals[normalizedAddress] !== undefined) {
        return tokenDecimals[normalizedAddress];
      }

      // Fetch from contract if not cached
      if (!walletClient) {
        return 18; // Default to 18 if no wallet connected
      }

      try {
        const signer = getSigner();
        const decimals = await getTokenDecimals(tokenAddress, signer);

        // Update cache
        setTokenDecimals((prev) => ({
          ...prev,
          [normalizedAddress]: decimals,
        }));

        return decimals;
      } catch (error) {
        console.error("Error fetching token decimals:", error);
        return 18; // Default to 18 on error
      }
    },
    [tokenDecimals, walletClient, getSigner]
  );

  // Fetch user locks
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

  // Check allowance
  const checkAllowance = useCallback(
    async (tokenAddress: string, amount: string): Promise<boolean> => {
      if (!address || !walletClient) return true;

      try {
        const signer = getSigner();
        const tokenContract = getERC20Contract(tokenAddress, signer);
        const allowance = await tokenContract.allowance(address, VAULTIO_ADDRESS);

        // Get token decimals dynamically
        const decimals = await getDecimals(tokenAddress);
        const amountInWei = parseTokenAmount(amount, decimals);

        console.log("allowance", allowance.toString());
        console.log("amountInWei", amountInWei.toString());
        console.log("decimals", decimals);
        console.log("Contract Address", VAULTIO_ADDRESS);
        console.log("Token Address", tokenAddress);
        console.log("Address", address);

        return allowance.lt(amountInWei);
      } catch (error) {
        console.error("Error checking allowance:", error);
        return true;
      }
    },
    [address, walletClient, getSigner, getDecimals]
  );

  // Approve tokens
  const approveTokens = useCallback(
    async (tokenAddress: string, amount: string): Promise<boolean> => {
      if (!address || !walletClient) {
        toast.error("Please connect your wallet");
        return false;
      }

      setIsApproving(true);
      try {
        const signer = getSigner();
        const tokenContract = getERC20Contract(tokenAddress, signer);

        // Get token decimals dynamically
        const decimals = await getDecimals(tokenAddress);
        const amountInWei = parseTokenAmount(amount, decimals);

        const tx = await tokenContract.approve(VAULTIO_ADDRESS, amountInWei);
        toast.loading("Approving tokens...", { id: "approve" });

        await tx.wait();
        toast.success("Token approved successfully", { id: "approve" });

        return true;
      } catch (error) {
        toast.error(formatTransactionError(error), { id: "approve" });
        return false;
      } finally {
        setIsApproving(false);
      }
    },
    [address, walletClient, getSigner, getDecimals]
  );

  // Lock tokens
  const lockTokens = useCallback(
    async (tokenAddress: string, amount: string, durationInMinutes: number): Promise<boolean> => {
      if (!address || !walletClient) {
        toast.error("Please connect your wallet");
        return false;
      }

      setIsLocking(true);
      try {
        const signer = getSigner();
        const vaultioContract = getVaultioContract(signer);

        // Get token decimals dynamically
        const decimals = await getDecimals(tokenAddress);
        const amountInWei = parseTokenAmount(amount, decimals);

        const tx = await vaultioContract.lockTokens(tokenAddress, amountInWei, durationInMinutes);

        toast.loading("Locking tokens...", { id: "lock" });
        await tx.wait();

        toast.success("Tokens locked successfully!", { id: "lock" });
        await fetchUserLocks();

        return true;
      } catch (error) {
        console.log("Error locking tokens:", error);
        toast.error(formatTransactionError(error), { id: "lock" });
        return false;
      } finally {
        setIsLocking(false);
      }
    },
    [address, walletClient, getSigner, fetchUserLocks, getDecimals]
  );

  // Withdraw tokens
  const withdrawTokens = useCallback(
    async (lockId: number): Promise<boolean> => {
      if (!address || !walletClient) {
        toast.error("Please connect your wallet");
        return false;
      }

      setIsWithdrawing(true);
      try {
        const signer = getSigner();
        const vaultioContract = getVaultioContract(signer);

        const tx = await vaultioContract.withdrawTokens(lockId);

        toast.loading("Withdrawing tokens...", { id: "withdraw" });
        await tx.wait();

        toast.success("Tokens withdrawn successfully!", { id: "withdraw" });
        await fetchUserLocks();

        return true;
      } catch (error) {
        console.log("Error withdrawing tokens:", error);
        toast.error(formatTransactionError(error), { id: "withdraw" });
        return false;
      } finally {
        setIsWithdrawing(false);
      }
    },
    [address, walletClient, getSigner, fetchUserLocks]
  );

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<VaultioContextState>(
    () => ({
      userLocks,
      isLoadingLocks,
      tokenDecimals,
      isApproving,
      isLocking,
      isWithdrawing,
      fetchUserLocks,
      getDecimals,
      checkAllowance,
      approveTokens,
      lockTokens,
      withdrawTokens,
    }),
    [
      userLocks,
      isLoadingLocks,
      tokenDecimals,
      isApproving,
      isLocking,
      isWithdrawing,
      fetchUserLocks,
      getDecimals,
      checkAllowance,
      approveTokens,
      lockTokens,
      withdrawTokens,
    ]
  );

  return <VaultioContext.Provider value={value}>{children}</VaultioContext.Provider>;
};

// Custom hook to use the Vaultio context
export const useVaultioContext = (): VaultioContextState => {
  const context = useContext(VaultioContext);

  if (context === undefined) {
    throw new Error("useVaultioContext must be used within a VaultioProvider");
  }

  return context;
};
