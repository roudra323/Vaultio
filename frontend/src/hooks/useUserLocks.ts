"use client";

import { useVaultioContext } from "@/contexts/VaultioContext";

/**
 * Hook for accessing and managing user's token locks
 * Provides a clean interface to the VaultioContext's lock data
 *
 * Usage:
 * const { userLocks, isLoading, refetchLocks, getDecimalsForToken } = useUserLocks();
 */
export const useUserLocks = () => {
  const { userLocks, isLoadingLocks, tokenDecimals, fetchUserLocks, getDecimalsForToken } =
    useVaultioContext();

  return {
    userLocks,
    isLoading: isLoadingLocks,
    tokenDecimals,
    getDecimalsForToken,
    refetchLocks: fetchUserLocks,
  };
};
