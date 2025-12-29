/**
 * Contract configuration
 * Addresses and re-exports for contract ABIs
 */

// Re-export ABIs from abi folder
export { VAULTIO_ABI, ERC20_ABI } from "@/abi";

// Multi-chain contract addresses
// Chain ID -> Contract Address mapping
export const VAULTIO_ADDRESSES: Record<number, string> = {
  1: process.env.NEXT_PUBLIC_VAULTIO_ADDRESS_MAINNET || "", // Ethereum Mainnet
  42161: process.env.NEXT_PUBLIC_VAULTIO_ADDRESS_ARBITRUM || "", // Arbitrum One
  11155111: process.env.NEXT_PUBLIC_VAULTIO_ADDRESS_SEPOLIA || "", // Sepolia Testnet
  31337: process.env.NEXT_PUBLIC_VAULTIO_ADDRESS_LOCAL || "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Hardhat Local
};

/**
 * Get Vaultio contract address for a specific chain
 * @param chainId - The chain ID to get the address for
 * @returns The contract address for the specified chain
 * @throws Error if contract is not deployed on the specified chain
 */
export const getVaultioAddress = (chainId: number): string => {
  const address = VAULTIO_ADDRESSES[chainId];
  if (!address) {
    throw new Error(`Vaultio contract not deployed on chain ${chainId}`);
  }
  return address;
};
