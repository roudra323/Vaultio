"use client";

import { useState, useCallback } from "react";
import { useWalletClient } from "wagmi";
import { walletClientToSigner, getTokenDecimals as fetchTokenDecimals } from "@/lib/ethers";

/**
 * Hook for caching and fetching token decimals
 * Provides a cache to avoid redundant RPC calls for the same tokens
 */
export const useTokenDecimals = () => {
  const { data: walletClient } = useWalletClient();
  const [decimalsCache, setDecimalsCache] = useState<Record<string, number>>({});

  /**
   * Get decimals for a token address, using cache when available
   * @param tokenAddress - The token contract address
   * @returns The number of decimals for the token
   */
  const getDecimals = useCallback(
    async (tokenAddress: string): Promise<number> => {
      const normalizedAddress = tokenAddress.toLowerCase();

      // Check cache first
      if (decimalsCache[normalizedAddress] !== undefined) {
        return decimalsCache[normalizedAddress];
      }

      // Default to 18 if no wallet connected
      if (!walletClient) {
        return 18;
      }

      try {
        const signer = walletClientToSigner(walletClient);
        const decimals = await fetchTokenDecimals(tokenAddress, signer);

        // Update cache
        setDecimalsCache((prev) => ({
          ...prev,
          [normalizedAddress]: decimals,
        }));

        return decimals;
      } catch (error) {
        console.error("Error fetching token decimals:", error);
        return 18;
      }
    },
    [walletClient, decimalsCache]
  );

  /**
   * Get decimals from cache only (synchronous)
   * Returns undefined if not cached
   */
  const getCachedDecimals = useCallback(
    (tokenAddress: string): number | undefined => {
      const normalizedAddress = tokenAddress.toLowerCase();
      return decimalsCache[normalizedAddress];
    },
    [decimalsCache]
  );

  /**
   * Batch fetch decimals for multiple tokens
   * Useful when loading a list of locks
   */
  const fetchDecimalsForTokens = useCallback(
    async (tokenAddresses: string[]): Promise<void> => {
      if (!walletClient) return;

      const uniqueAddresses = [...new Set(tokenAddresses.map((addr) => addr.toLowerCase()))];
      const uncachedAddresses = uniqueAddresses.filter((addr) => decimalsCache[addr] === undefined);

      if (uncachedAddresses.length === 0) return;

      const signer = walletClientToSigner(walletClient);
      const results = await Promise.all(
        uncachedAddresses.map(async (addr) => {
          const decimals = await fetchTokenDecimals(addr, signer);
          return { address: addr, decimals };
        })
      );

      const newDecimals: Record<string, number> = {};
      results.forEach(({ address, decimals }) => {
        newDecimals[address] = decimals;
      });

      setDecimalsCache((prev) => ({ ...prev, ...newDecimals }));
    },
    [walletClient, decimalsCache]
  );

  return {
    decimalsCache,
    getDecimals,
    getCachedDecimals,
    fetchDecimalsForTokens,
  };
};
