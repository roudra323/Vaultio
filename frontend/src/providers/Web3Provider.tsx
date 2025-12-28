"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import { VaultioProvider } from "@/contexts/VaultioContext";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

type Web3ProviderProps = {
  children: React.ReactNode;
};

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <VaultioProvider>{children}</VaultioProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
