"use client";

import { useState, useCallback } from "react";
import { useAccount, useWalletClient, useChainId } from "wagmi";
import { toast } from "sonner";
import { walletClientToSigner, getVaultioContract } from "@/lib/ethers";
import { formatTransactionError } from "@/lib/errors";
import type { TransactionStatus } from "@/types";

/**
 * Hook for handling token withdrawal from locks
 * Manages transaction state and provides withdraw function
 */
export const useWithdraw = (onSuccess?: () => void) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  const [status, setStatus] = useState<TransactionStatus>("idle");

  /**
   * Get signer from wallet client
   */
  const getSigner = useCallback(() => {
    if (!walletClient) {
      throw new Error("Wallet not connected");
    }
    return walletClientToSigner(walletClient);
  }, [walletClient]);

  /**
   * Withdraw tokens from a specific lock
   * @param lockId - The ID of the lock to withdraw from
   * @returns True if withdrawal was successful
   */
  const withdraw = useCallback(
    async (lockId: number): Promise<boolean> => {
      if (!address || !walletClient || !chainId) {
        toast.error("Please connect your wallet");
        return false;
      }

      setStatus("pending");
      try {
        const signer = getSigner();
        const vaultioContract = getVaultioContract(signer, chainId);

        const tx = await vaultioContract.withdrawTokens(lockId);

        toast.loading("Withdrawing tokens...", { id: "withdraw" });
        await tx.wait();

        toast.success("Tokens withdrawn successfully!", { id: "withdraw" });
        setStatus("success");
        onSuccess?.();

        return true;
      } catch (error) {
        toast.error(formatTransactionError(error), { id: "withdraw" });
        setStatus("error");
        return false;
      }
    },
    [address, walletClient, chainId, getSigner, onSuccess]
  );

  /**
   * Reset transaction state
   */
  const reset = useCallback(() => {
    setStatus("idle");
  }, []);

  return {
    withdraw,
    reset,
    status,
    isWithdrawing: status === "pending",
  };
};
