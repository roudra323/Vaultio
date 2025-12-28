import { ethers } from "ethers";
import { ERC20_ABI } from "@/abis";
import type { Signer } from "@/types";

/**
 * Create an ERC20 contract instance
 */
const getERC20Contract = (
  tokenAddress: string,
  signer: Signer
): ethers.Contract => {
  return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
};

/**
 * Parse token amount to wei
 */
export const parseTokenAmount = (
  amount: string,
  decimals: number = 18
): ethers.BigNumber => {
  return ethers.utils.parseUnits(amount, decimals);
};

/**
 * Format wei amount to human-readable string
 */
export const formatTokenAmount = (
  amount: ethers.BigNumber,
  decimals: number = 18
): string => {
  return ethers.utils.formatUnits(amount, decimals);
};

/**
 * Check if approval is needed for a given amount
 * @returns true if approval is needed, false if already approved
 */
export const checkNeedsApproval = async (
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
  amount: string,
  signer: Signer
): Promise<boolean> => {
  const tokenContract = getERC20Contract(tokenAddress, signer);
  const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
  const amountInWei = parseTokenAmount(amount);
  return allowance.lt(amountInWei);
};

/**
 * Approve tokens for spending
 * @returns Transaction receipt
 */
export const approveTokens = async (
  tokenAddress: string,
  spenderAddress: string,
  amount: string,
  signer: Signer
): Promise<ethers.ContractTransaction> => {
  const tokenContract = getERC20Contract(tokenAddress, signer);
  const amountInWei = parseTokenAmount(amount);
  return tokenContract.approve(spenderAddress, amountInWei);
};

/**
 * Get token balance for an address
 */
export const getTokenBalance = async (
  tokenAddress: string,
  ownerAddress: string,
  signer: Signer
): Promise<ethers.BigNumber> => {
  const tokenContract = getERC20Contract(tokenAddress, signer);
  return tokenContract.balanceOf(ownerAddress);
};

/**
 * Get token decimals
 */
export const getTokenDecimals = async (
  tokenAddress: string,
  signer: Signer
): Promise<number> => {
  const tokenContract = getERC20Contract(tokenAddress, signer);
  return tokenContract.decimals();
};

/**
 * Get token symbol
 */
export const getTokenSymbol = async (
  tokenAddress: string,
  signer: Signer
): Promise<string> => {
  const tokenContract = getERC20Contract(tokenAddress, signer);
  return tokenContract.symbol();
};

/**
 * Get token name
 */
export const getTokenName = async (
  tokenAddress: string,
  signer: Signer
): Promise<string> => {
  const tokenContract = getERC20Contract(tokenAddress, signer);
  return tokenContract.name();
};

