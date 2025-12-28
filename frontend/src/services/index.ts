// ERC20 Service
export {
  parseTokenAmount,
  formatTokenAmount,
  checkNeedsApproval,
  approveTokens,
  getTokenBalance,
  getTokenDecimals,
  getTokenSymbol,
  getTokenName,
} from "./erc20.service";

// Vaultio Service
export {
  getUserLocks,
  getLock,
  getUserLockCount,
  isLockWithdrawable,
  lockTokens,
  withdrawTokens,
  getVaultioAddress,
} from "./vaultio.service";

