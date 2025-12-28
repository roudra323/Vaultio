"use client";

import { useVaultioContext } from "@/contexts/VaultioContext";
import type { Lock } from "@/types";

/**
 * Custom hook to interact with the Vaultio contract
 *
 * This hook provides access to the VaultioContext which manages:
 * - Contract interactions through the service layer
 * - State management for locks, loading states, and transaction states
 *
 * The context uses Wagmi's WalletClient for wallet connection
 * and services with Ethers v5 for contract interactions
 */
export const useVaultio = () => {
  const context = useVaultioContext();

  return {
    // Data
    userLocks: context.userLocks,
    isLoadingLocks: context.isLoadingLocks,

    // Transaction states
    isApproving: context.isApproving,
    isLocking: context.isLocking,
    isWithdrawing: context.isWithdrawing,

    // Actions
    checkAllowance: context.checkAllowance,
    approveTokens: context.approveTokens,
    lockTokens: context.lockTokens,
    withdrawTokens: context.withdrawTokens,
    refetchLocks: context.fetchUserLocks,
  };
};

// Re-export the Lock type for convenience
export type { Lock };
