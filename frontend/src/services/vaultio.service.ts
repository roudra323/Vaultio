import { ethers } from "ethers";
import { VAULTIO_ABI } from "@/abis";
import { VAULTIO_ADDRESS } from "@/constants";
import { parseTokenAmount } from "./erc20.service";
import type { Lock, Signer } from "@/types";

/**
 * Create a Vaultio contract instance
 */
const getVaultioContract = (signer: Signer): ethers.Contract => {
  return new ethers.Contract(VAULTIO_ADDRESS, VAULTIO_ABI, signer);
};

/**
 * Get all locks for a user
 */
export const getUserLocks = async (
  userAddress: string,
  signer: Signer
): Promise<Lock[]> => {
  const vaultioContract = getVaultioContract(signer);
  const locks = await vaultioContract.getUserLocks(userAddress);

  return locks.map((lock: Lock) => ({
    token: lock.token,
    amount: lock.amount,
    startTime: lock.startTime,
    unlockTime: lock.unlockTime,
    withdrawn: lock.withdrawn,
  }));
};

/**
 * Get a specific lock for a user
 */
export const getLock = async (
  userAddress: string,
  lockId: number,
  signer: Signer
): Promise<Lock> => {
  const vaultioContract = getVaultioContract(signer);
  const lock = await vaultioContract.getLock(userAddress, lockId);

  return {
    token: lock.token,
    amount: lock.amount,
    startTime: lock.startTime,
    unlockTime: lock.unlockTime,
    withdrawn: lock.withdrawn,
  };
};

/**
 * Get lock count for a user
 */
export const getUserLockCount = async (
  userAddress: string,
  signer: Signer
): Promise<number> => {
  const vaultioContract = getVaultioContract(signer);
  const count = await vaultioContract.getUserLockCount(userAddress);
  return count.toNumber();
};

/**
 * Check if a lock is withdrawable
 */
export const isLockWithdrawable = async (
  userAddress: string,
  lockId: number,
  signer: Signer
): Promise<boolean> => {
  const vaultioContract = getVaultioContract(signer);
  return vaultioContract.isWithdrawable(userAddress, lockId);
};

/**
 * Lock tokens in the vault
 * @returns Transaction object
 */
export const lockTokens = async (
  tokenAddress: string,
  amount: string,
  durationInMinutes: number,
  signer: Signer
): Promise<ethers.ContractTransaction> => {
  const vaultioContract = getVaultioContract(signer);
  const amountInWei = parseTokenAmount(amount);

  return vaultioContract.lockTokens(tokenAddress, amountInWei, durationInMinutes);
};

/**
 * Withdraw tokens from a lock
 * @returns Transaction object
 */
export const withdrawTokens = async (
  lockId: number,
  signer: Signer
): Promise<ethers.ContractTransaction> => {
  const vaultioContract = getVaultioContract(signer);
  return vaultioContract.withdrawTokens(lockId);
};

/**
 * Get the Vaultio contract address
 */
export const getVaultioAddress = (): string => {
  return VAULTIO_ADDRESS;
};

