import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { mainnet, sepolia, hardhat } from "wagmi/chains";

// Use environment variable for Hardhat RPC URL (supports Docker networking)
const HARDHAT_RPC_URL =
  process.env.NEXT_PUBLIC_HARDHAT_RPC_URL || "http://127.0.0.1:8545";

export const config = getDefaultConfig({
  appName: "Vaultio",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
  chains: [mainnet, sepolia, hardhat],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [hardhat.id]: http(HARDHAT_RPC_URL),
  },
  ssr: true,
});
