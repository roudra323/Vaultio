"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronRight, Copy, LogOut } from "lucide-react";
import { useState } from "react";

export const ConnectWalletButton = () => {
  const [copied, setCopied] = useState(false);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
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
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-vaultio-purple to-vaultio-cyan text-white font-medium text-sm hover:shadow-lg hover:shadow-vaultio-purple/25 transition-all duration-200"
                  >
                    Connect Wallet
                    <ChevronRight className="w-4 h-4" />
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-destructive text-white font-medium text-sm"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  {/* Connected wallet display */}
                  <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-card border border-border">
                    {/* Status indicator */}
                    <div className="w-2 h-2 rounded-full bg-vaultio-cyan animate-pulse" />
                    
                    {/* Address */}
                    <span className="text-sm font-medium text-white">
                      {account.displayName}
                    </span>
                    
                    {/* Copy button */}
                    <button
                      onClick={() => copyAddress(account.address)}
                      className="p-1 hover:bg-secondary rounded transition-colors"
                      title={copied ? "Copied!" : "Copy address"}
                    >
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Avatar */}
                  <button
                    onClick={openAccountModal}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-vaultio-purple to-vaultio-cyan flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-vaultio-cyan transition-all"
                  >
                    {account.ensAvatar ? (
                      <img
                        alt={account.displayName}
                        src={account.ensAvatar}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">🦊</span>
                    )}
                  </button>

                  {/* Disconnect button */}
                  <button
                    onClick={openAccountModal}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    title="Account"
                  >
                    <LogOut className="w-5 h-5 text-muted-foreground" />
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
