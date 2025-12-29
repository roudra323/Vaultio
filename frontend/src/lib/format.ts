import { ethers } from "ethers";

/**
 * Formatting utilities for the Vaultio application
 * Centralized to avoid duplication across components
 */

/**
 * Shorten an Ethereum address for display
 * @param address - Full Ethereum address
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns Shortened address like "0x1234...5678"
 */
export const shortenAddress = (address: string, chars = 4): string => {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

/**
 * Format a BigNumber timestamp to a readable date string
 * @param timestamp - Unix timestamp as BigNumber (seconds)
 * @returns Formatted date string "MM/DD/YY | HH:MM AM/PM"
 */
export const formatDate = (timestamp: ethers.BigNumber): string => {
  const date = new Date(timestamp.toNumber() * 1000);
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
 * Format a BigNumber token amount to a human-readable string
 * @param amount - Token amount as BigNumber (in wei)
 * @param decimals - Token decimals (default: 18)
 * @returns Formatted token amount
 */
export const formatTokenAmount = (amount: ethers.BigNumber, decimals = 18): string => {
  return ethers.utils.formatUnits(amount, decimals);
};

/**
 * Parse a human-readable token amount to BigNumber
 * @param amount - Human-readable amount string
 * @param decimals - Token decimals (default: 18)
 * @returns Token amount as BigNumber
 */
export const parseTokenAmount = (amount: string, decimals = 18): ethers.BigNumber => {
  return ethers.utils.parseUnits(amount, decimals);
};

/**
 * Format duration in minutes to a human-readable string
 * @param minutes - Duration in minutes
 * @returns Human-readable duration string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? "s" : ""}`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""}`;
};

/**
 * Check if a lock is currently unlocked (can be withdrawn)
 * @param unlockTime - Unlock timestamp as BigNumber
 * @param currentTime - Current time in milliseconds (Date.now())
 * @returns True if the lock period has expired
 */
export const isLockUnlocked = (unlockTime: ethers.BigNumber, currentTime: number): boolean => {
  return currentTime >= unlockTime.toNumber() * 1000;
};
