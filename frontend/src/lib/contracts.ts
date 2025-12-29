/**
 * Contract configuration
 * Addresses and re-exports for contract ABIs
 */

// Re-export ABIs from abi folder
export { VAULTIO_ABI, ERC20_ABI } from "@/abi";

// Contract Addresses
export const VAULTIO_ADDRESS =
  process.env.NEXT_PUBLIC_VAULTIO_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
