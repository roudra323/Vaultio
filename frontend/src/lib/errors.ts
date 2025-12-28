/**
 * Vaultio contract custom error mappings
 */
const VAULTIO_CUSTOM_ERRORS: Record<string, string> = {
  InvalidTokenAddress: "Invalid token address provided",
  InvalidAmount: "Amount must be greater than zero",
  InvalidDuration: "Lock duration must be greater than zero",
  InsufficientTokenBalance: "You don't have enough tokens in your wallet",
  InsufficientTokenAllowance: "Please approve tokens before locking",
  InvalidLockId: "Lock not found",
  TokensAlreadyWithdrawn: "These tokens have already been withdrawn",
  LockPeriodNotExpired: "Lock period has not expired yet",
  CallerIsNotAnWalletAddress:
    "Only wallet addresses can interact with this contract",
};

/**
 * Check if error is a user rejection
 */
const isUserRejection = (errorString: string): boolean => {
  return (
    errorString.includes("ACTION_REJECTED") ||
    errorString.includes("user rejected") ||
    errorString.includes("User denied") ||
    errorString.includes("User rejected")
  );
};

/**
 * Check for Vaultio custom errors
 */
const getVaultioError = (errorString: string): string | null => {
  for (const [errorName, friendlyMessage] of Object.entries(
    VAULTIO_CUSTOM_ERRORS
  )) {
    if (errorString.includes(errorName)) {
      return friendlyMessage;
    }
  }
  return null;
};

/**
 * Extract reason from error string
 */
const extractReason = (errorString: string): string | null => {
  const reasonMatch = errorString.match(/reason="([^"]+)"/);
  return reasonMatch ? reasonMatch[1] : null;
};

/**
 * Format ethers.js and wallet errors into user-friendly messages
 */
export const formatTransactionError = (error: unknown): string => {
  const errorString = error instanceof Error ? error.message : String(error);

  // User rejected transaction
  if (isUserRejection(errorString)) {
    return "Transaction cancelled by user";
  }

  // Check for Vaultio custom errors
  const vaultioError = getVaultioError(errorString);
  if (vaultioError) {
    return vaultioError;
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

  // Contract revert errors
  if (errorString.includes("reverted") || errorString.includes("revert")) {
    const reason = extractReason(errorString);
    if (reason) {
      return `Transaction failed: ${reason}`;
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

  // Try to extract a simple message
  const reason = extractReason(errorString);
  if (reason) {
    return reason;
  }

  return "Transaction failed. Please try again";
};

/**
 * Check if an error is a transaction error
 */
export const isTransactionError = (error: unknown): boolean => {
  const errorString = error instanceof Error ? error.message : String(error);
  return (
    errorString.includes("transaction") ||
    errorString.includes("Transaction") ||
    errorString.includes("reverted") ||
    errorString.includes("rejected")
  );
};

