import type { ethers } from "ethers";

/**
 * Represents a token lock in the Vaultio vault
 */
export type Lock = {
  /** The address of the locked ERC-20 token */
  token: string;
  /** The amount of tokens locked (in wei) */
  amount: ethers.BigNumber;
  /** Unix timestamp when the lock was created */
  startTime: ethers.BigNumber;
  /** Unix timestamp when tokens can be withdrawn */
  unlockTime: ethers.BigNumber;
  /** Whether the tokens have been withdrawn */
  withdrawn: boolean;
};

/**
 * Lock with its index for UI purposes
 */
export type LockWithIndex = {
  lock: Lock;
  index: number;
};

