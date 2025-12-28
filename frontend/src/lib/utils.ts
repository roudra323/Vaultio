import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Vaultio contract custom error mappings
const VAULTIO_CUSTOM_ERRORS: Record<string, string> = {
  InvalidTokenAddress: "Invalid token address provided",
  InvalidAmount: "Amount must be greater than zero",
  InvalidDuration: "Lock duration must be greater than zero",
  InsufficientTokenBalance: "You don't have enough tokens in your wallet",
  InsufficientTokenAllowance: "Please approve tokens before locking",
  InvalidLockId: "Lock not found",
  TokensAlreadyWithdrawn: "These tokens have already been withdrawn",
  LockPeriodNotExpired: "Lock period has not expired yet",
  CallerIsNotAnWalletAddress: "Only wallet addresses can interact with this contract",
};

// Format ethers.js and wallet errors into user-friendly messages
export const formatTransactionError = (error: unknown): string => {
  const errorString = error instanceof Error ? error.message : String(error);

  // User rejected transaction
  if (
    errorString.includes("ACTION_REJECTED") ||
    errorString.includes("user rejected") ||
    errorString.includes("User denied") ||
    errorString.includes("User rejected")
  ) {
    return "Transaction cancelled by user";
  }

  // Check for Vaultio custom errors
  for (const [errorName, friendlyMessage] of Object.entries(VAULTIO_CUSTOM_ERRORS)) {
    if (errorString.includes(errorName)) {
      return friendlyMessage;
    }
  }

  // Insufficient funds for gas
  if (
    errorString.includes("INSUFFICIENT_FUNDS") ||
    errorString.includes("insufficient funds")
  ) {
    return "Insufficient funds for gas fees";
  }

  // Unpredictable gas limit (transaction would fail)
  if (
    errorString.includes("UNPREDICTABLE_GAS_LIMIT") ||
    errorString.includes("cannot estimate gas")
  ) {
    return "Transaction would fail. Please check your inputs and try again";
  }

  // Network errors
  if (
    errorString.includes("NETWORK_ERROR") ||
    errorString.includes("network changed")
  ) {
    return "Network error. Please check your connection and try again";
  }

  // Nonce errors
  if (errorString.includes("NONCE_EXPIRED") || errorString.includes("nonce")) {
    return "Transaction nonce error. Please try again";
  }

  // Timeout errors
  if (errorString.includes("TIMEOUT") || errorString.includes("timeout")) {
    return "Transaction timed out. Please try again";
  }

  // Contract revert errors - try to extract the reason
  if (errorString.includes("reverted") || errorString.includes("revert")) {
    const reasonMatch = errorString.match(/reason="([^"]+)"/);
    if (reasonMatch) {
      return `Transaction failed: ${reasonMatch[1]}`;
    }
    return "Transaction reverted. Please check your inputs";
  }

  // Allowance/approval specific errors
  if (errorString.includes("allowance") || errorString.includes("Allowance")) {
    return "Insufficient token allowance. Please approve tokens first";
  }

  // Balance errors
  if (
    errorString.includes("transfer amount exceeds balance") ||
    errorString.includes("exceeds balance")
  ) {
    return "Insufficient token balance";
  }

  // If we can't identify the error, return a generic but clean message
  // Try to extract a simple message if possible
  const simpleMessageMatch = errorString.match(/reason="([^"]+)"/);
  if (simpleMessageMatch) {
    return simpleMessageMatch[1];
  }

  return "Transaction failed. Please try again";
};
