"use client";

import { ethers } from "ethers";
import type { WalletClient } from "viem";
import { VAULTIO_ADDRESS, VAULTIO_ABI, ERC20_ABI } from "./contracts";

/**
 * Convert a Wagmi WalletClient to an Ethers.js Signer
 * This approach allows us to use Wagmi for wallet management
 * while using Ethers v5 for contract interactions
 */
export const walletClientToSigner = (walletClient: WalletClient): ethers.Signer => {
  const { account, chain, transport } = walletClient;

  if (!account || !chain) {
    throw new Error("Wallet not connected");
  }

  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  const provider = new ethers.providers.Web3Provider(transport, network);
  return provider.getSigner(account.address);
};

/**
 * Convert a Wagmi WalletClient to an Ethers.js Provider
 */
export const walletClientToProvider = (
  walletClient: WalletClient
): ethers.providers.Web3Provider => {
  const { chain, transport } = walletClient;

  if (!chain) {
    throw new Error("Chain not available");
  }

  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };

  return new ethers.providers.Web3Provider(transport, network);
};

/**
 * Get a Vaultio contract instance with a signer
 */
export const getVaultioContract = (signer: ethers.Signer): ethers.Contract => {
  return new ethers.Contract(VAULTIO_ADDRESS, VAULTIO_ABI, signer);
};

/**
 * Get an ERC20 contract instance with a signer
 */
export const getERC20Contract = (tokenAddress: string, signer: ethers.Signer): ethers.Contract => {
  return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
};

/**
 * Fetch token decimals from an ERC20 contract
 * Returns the decimal count (typically 6, 8, or 18)
 * Defaults to 18 if the call fails (for non-standard tokens)
 */
export const getTokenDecimals = async (
  tokenAddress: string,
  signer: ethers.Signer
): Promise<number> => {
  try {
    const tokenContract = getERC20Contract(tokenAddress, signer);
    const decimals = await tokenContract.decimals();
    return decimals;
  } catch (error) {
    console.warn(`Failed to fetch decimals for token ${tokenAddress}, defaulting to 18:`, error);
    return 18;
  }
};

export type { ethers };
