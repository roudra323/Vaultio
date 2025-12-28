import type { ethers } from "ethers";

/**
 * Parameters for locking tokens
 */
export type LockTokensParams = {
  tokenAddress: string;
  amount: string;
  durationInMinutes: number;
};

/**
 * Parameters for approving tokens
 */
export type ApproveTokensParams = {
  tokenAddress: string;
  amount: string;
};

/**
 * Transaction result with success status
 */
export type TransactionResult = {
  success: boolean;
  hash?: string;
  error?: string;
};

/**
 * Signer type alias for clarity
 */
export type Signer = ethers.Signer;

/**
 * Contract instance type alias
 */
export type Contract = ethers.Contract;

