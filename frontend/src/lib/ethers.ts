"use client";

import { ethers } from "ethers";
import type { WalletClient } from "viem";

/**
 * Convert a Wagmi WalletClient to an Ethers.js Signer
 * This adapter allows using Wagmi for wallet management
 * while using Ethers v5 for contract interactions
 */
export const walletClientToSigner = (
  walletClient: WalletClient
): ethers.Signer => {
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

export type { ethers };
