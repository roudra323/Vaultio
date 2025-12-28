import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ethers } from "ethers";

/**
 * Merge Tailwind CSS classes with clsx
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

/**
 * Format an Ethereum address for display (e.g., 0x1234...5678)
 */
export const formatAddress = (address: string, prefixLength = 6, suffixLength = 4): string => {
  if (!address || address.length < prefixLength + suffixLength) {
    return address;
  }
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
};

/**
 * Format a BigNumber amount to a human-readable string
 */
export const formatTokenAmount = (
  amount: ethers.BigNumber,
  decimals: number = 18
): string => {
  return ethers.utils.formatUnits(amount, decimals);
};

/**
 * Parse a string amount to BigNumber
 */
export const parseTokenAmount = (
  amount: string,
  decimals: number = 18
): ethers.BigNumber => {
  return ethers.utils.parseUnits(amount, decimals);
};

/**
 * Format a Unix timestamp to a readable date string
 */
export const formatDate = (timestamp: ethers.BigNumber | number): string => {
  const ts = typeof timestamp === "number" ? timestamp : timestamp.toNumber();
  const date = new Date(ts * 1000);

  return (
    date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    }) +
    " | " +
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  );
};

/**
 * Check if a lock is unlocked based on current time
 */
export const isUnlocked = (unlockTime: ethers.BigNumber | number): boolean => {
  const unlockTs =
    typeof unlockTime === "number" ? unlockTime : unlockTime.toNumber();
  return Date.now() >= unlockTs * 1000;
};

/**
 * Format a number with commas for thousands
 */
export const formatNumber = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US").format(num);
};

/**
 * Validate an Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  return ethers.utils.isAddress(address);
};

/**
 * Truncate a string to a maximum length
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
};

// Re-export error formatting
export { formatTransactionError, isTransactionError } from "./errors";
