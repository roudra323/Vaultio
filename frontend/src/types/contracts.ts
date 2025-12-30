import type { ethers } from "ethers";

/**
 * Ethereum address type - hex string starting with 0x
 */
export type Address = `0x${string}`;

/**
 * Lock data structure matching the Vaultio smart contract
 */
export type Lock = {
  token: Address;
  amount: ethers.BigNumber;
  startTime: ethers.BigNumber;
  unlockTime: ethers.BigNumber;
  withdrawn: boolean;
};

/**
 * Parameters for locking tokens
 */
export type LockParams = {
  tokenAddress: Address;
  amount: string;
  durationInMinutes: number;
};

/**
 * Parameters for approving tokens
 */
export type ApproveParams = {
  tokenAddress: Address;
  amount: string;
};

/**
 * Transaction status for async operations
 */
export type TransactionStatus = "idle" | "pending" | "success" | "error";
