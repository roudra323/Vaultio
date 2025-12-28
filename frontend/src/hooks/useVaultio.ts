"use client";

import { useVaultioContext, type Lock } from "@/contexts/VaultioContext";

/**
 * Custom hook to interact with the Vaultio contract
 *
 * This hook provides access to the VaultioContext which manages:
 * - Contract interactions using Ethers v5
 * - State management for locks, loading states, and transaction states
 *
 * The context uses Wagmi's WalletClient for wallet connection
 * but Ethers v5 for all contract interactions
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
    needsApproval: true, // Will be determined by checkAllowance

    // Actions
    checkAllowance: context.checkAllowance,
    approveTokens: context.approveTokens,
    lockTokens: context.lockTokens,
    withdrawTokens: context.withdrawTokens,
    refetchLocks: context.fetchUserLocks,
  };
};

// Re-export the Lock type for backwards compatibility
export type { Lock };
