"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronRight, Copy, LogOut } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export const ConnectWalletButton = () => {
  const [copied, setCopied] = useState(false);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}>
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="from-vaultio-purple to-vaultio-cyan hover:shadow-vaultio-purple/25 flex items-center gap-2 rounded-full bg-linear-to-r px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg">
                    Connect Wallet
                    <ChevronRight className="h-4 w-4" />
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="bg-destructive flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white">
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  {/* Connected wallet display */}
                  <div className="bg-card border-border flex items-center gap-3 rounded-full border px-4 py-2">
                    {/* Status indicator */}
                    <div className="bg-vaultio-cyan h-2 w-2 animate-pulse rounded-full" />

                    {/* Address */}
                    <span className="text-sm font-medium text-white">{account.displayName}</span>

                    {/* Copy button */}
                    <button
                      onClick={() => copyAddress(account.address)}
                      className="hover:bg-secondary rounded p-1 transition-colors"
                      title={copied ? "Copied!" : "Copy address"}>
                      <Copy className="text-muted-foreground h-4 w-4" />
                    </button>
                  </div>

                  {/* Avatar */}
                  <button
                    onClick={openAccountModal}
                    className="from-vaultio-purple to-vaultio-cyan hover:ring-vaultio-cyan flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-linear-to-br transition-all hover:ring-2">
                    {account.ensAvatar ? (
                      <Image
                        alt={account.displayName}
                        src={account.ensAvatar}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-lg">🦊</span>
                    )}
                  </button>

                  {/* Disconnect button */}
                  <button
                    onClick={openAccountModal}
                    className="hover:bg-secondary rounded-lg p-2 transition-colors"
                    title="Account">
                    <LogOut className="text-muted-foreground h-5 w-5" />
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
