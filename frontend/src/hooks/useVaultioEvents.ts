"use client";

import { useEffect, useMemo } from "react";
import { useAccount, useWalletClient, useChainId } from "wagmi";
import { walletClientToProvider, getVaultioContractReadOnly } from "@/lib/ethers";

/**
 * Hook for listening to Vaultio contract events
 * Provides real-time updates when tokens are locked or withdrawn
 * @param onTokenLocked - Callback when TokenLocked event is emitted
 * @param onTokenWithdrawn - Callback when TokenWithdrawn event is emitted
 * @param enabled - Whether to enable event listening (default: true)
 */
export const useVaultioEvents = (
  onTokenLocked?: () => void,
  onTokenWithdrawn?: () => void,
  enabled: boolean = true
) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  // Memoized read-only contract
  const contract = useMemo(() => {
    if (!walletClient || !chainId) return null;
    try {
      return getVaultioContractReadOnly(walletClientToProvider(walletClient), chainId);
    } catch {
      return null;
    }
  }, [walletClient, chainId]);

  useEffect(() => {
    if (!enabled || !address || !contract) return;

    const handleLocked = () => {
      try {
        onTokenLocked?.();
      } catch (e) {
        console.error("TokenLocked handler error:", e);
      }
    };

    const handleWithdrawn = () => {
      try {
        onTokenWithdrawn?.();
      } catch (e) {
        console.error("TokenWithdrawn handler error:", e);
      }
    };

    const lockedFilter = contract.filters.TokenLocked(address, null, null);
    const withdrawnFilter = contract.filters.TokenWithdrawn(address, null, null);

    contract.on(lockedFilter, handleLocked);
    contract.on(withdrawnFilter, handleWithdrawn);

    return () => {
      contract.off(lockedFilter, handleLocked);
      contract.off(withdrawnFilter, handleWithdrawn);
    };
  }, [enabled, address, contract, onTokenLocked, onTokenWithdrawn]);

  return { isListening: enabled && !!address && !!contract };
};
