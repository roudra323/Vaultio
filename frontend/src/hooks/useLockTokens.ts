"use client";

import { useState, useCallback } from "react";
import { useAccount, useWalletClient, useChainId } from "wagmi";
import { toast } from "sonner";
import {
  walletClientToSigner,
  getVaultioContract,
  getERC20Contract,
  getTokenDecimals,
} from "@/lib/ethers";
import { parseTokenAmount } from "@/lib/format";
import { formatTransactionError } from "@/lib/errors";
import { getVaultioAddress } from "@/lib/contracts";
import type { TransactionStatus, LockParams, ApproveParams } from "@/types";

/**
 * Hook for handling the token approval and locking flow
 * Manages transaction states and provides approve/lock functions
 */
export const useLockTokens = (onSuccess?: () => void) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  const [approveStatus, setApproveStatus] = useState<TransactionStatus>("idle");
  const [lockStatus, setLockStatus] = useState<TransactionStatus>("idle");

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
   * Check if the user needs to approve tokens
   * Returns true if approval is needed
   */
  const checkNeedsApproval = useCallback(
    async (tokenAddress: string, amount: string): Promise<boolean> => {
      if (!address || !walletClient || !chainId) return true;

      try {
        const signer = getSigner();
        const tokenContract = getERC20Contract(tokenAddress, signer);
        const vaultioAddress = getVaultioAddress(chainId);
        const allowance = await tokenContract.allowance(address, vaultioAddress);

        const decimals = await getTokenDecimals(tokenAddress, signer);
        const amountInWei = parseTokenAmount(amount, decimals);

        return allowance.lt(amountInWei);
      } catch (error) {
        console.error("Error checking allowance:", error);
        return true;
      }
    },
    [address, walletClient, chainId, getSigner]
  );

  /**
   * Approve tokens for the Vaultio contract
   */
  const approve = useCallback(
    async ({ tokenAddress, amount }: ApproveParams): Promise<boolean> => {
      if (!address || !walletClient || !chainId) {
        toast.error("Please connect your wallet");
        return false;
      }

      setApproveStatus("pending");
      try {
        const signer = getSigner();
        const tokenContract = getERC20Contract(tokenAddress, signer);
        const vaultioAddress = getVaultioAddress(chainId);

        const decimals = await getTokenDecimals(tokenAddress, signer);
        const amountInWei = parseTokenAmount(amount, decimals);

        const tx = await tokenContract.approve(vaultioAddress, amountInWei);
        toast.loading("Approving tokens...", { id: "approve" });

        await tx.wait();
        toast.success("Token approved successfully", { id: "approve" });

        setApproveStatus("success");
        return true;
      } catch (error) {
        toast.error(formatTransactionError(error), { id: "approve" });
        setApproveStatus("error");
        return false;
      }
    },
    [address, walletClient, chainId, getSigner]
  );

  /**
   * Lock tokens in the Vaultio contract
   */
  const lock = useCallback(
    async ({ tokenAddress, amount, durationInMinutes }: LockParams): Promise<boolean> => {
      if (!address || !walletClient || !chainId) {
        toast.error("Please connect your wallet");
        return false;
      }

      setLockStatus("pending");
      try {
        const signer = getSigner();
        const vaultioContract = getVaultioContract(signer, chainId);

        const decimals = await getTokenDecimals(tokenAddress, signer);
        const amountInWei = parseTokenAmount(amount, decimals);

        const tx = await vaultioContract.lockTokens(tokenAddress, amountInWei, durationInMinutes);

        toast.loading("Locking tokens...", { id: "lock" });
        await tx.wait();

        toast.success("Tokens locked successfully!", { id: "lock" });
        setLockStatus("success");
        onSuccess?.();

        return true;
      } catch (error) {
        toast.error(formatTransactionError(error), { id: "lock" });
        setLockStatus("error");
        return false;
      }
    },
    [address, walletClient, chainId, getSigner, onSuccess]
  );

  /**
   * Reset transaction states
   */
  const reset = useCallback(() => {
    setApproveStatus("idle");
    setLockStatus("idle");
  }, []);

  return {
    approve,
    lock,
    checkNeedsApproval,
    reset,
    approveStatus,
    lockStatus,
    isApproving: approveStatus === "pending",
    isLocking: lockStatus === "pending",
    isLoading: approveStatus === "pending" || lockStatus === "pending",
  };
};
