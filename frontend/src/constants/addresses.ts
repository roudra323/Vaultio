/**
 * Contract addresses for different networks
 */

// Default Vaultio contract address (localhost/hardhat)
const DEFAULT_VAULTIO_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

/**
 * Vaultio contract address
 * Uses environment variable if available, otherwise defaults to localhost
 */
export const VAULTIO_ADDRESS =
  process.env.NEXT_PUBLIC_VAULTIO_ADDRESS || DEFAULT_VAULTIO_ADDRESS;

/**
 * Network-specific addresses for future multi-chain support
 */
export const NETWORK_ADDRESSES = {
  // Hardhat local network
  31337: {
    vaultio: DEFAULT_VAULTIO_ADDRESS,
  },
  // Sepolia testnet
  11155111: {
    vaultio: process.env.NEXT_PUBLIC_SEPOLIA_VAULTIO_ADDRESS || "",
  },
  // Mainnet
  1: {
    vaultio: process.env.NEXT_PUBLIC_MAINNET_VAULTIO_ADDRESS || "",
  },
} as const;

/**
 * Get Vaultio address for a specific chain ID
 */
export const getVaultioAddress = (chainId: number): string => {
  const addresses = NETWORK_ADDRESSES[chainId as keyof typeof NETWORK_ADDRESSES];
  return addresses?.vaultio || VAULTIO_ADDRESS;
};

