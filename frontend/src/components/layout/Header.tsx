"use client";

import Link from "next/link";
import { VaultioLogo } from "@/components/icons";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";

export const Header = () => {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <VaultioLogo size={36} />
          <span className="text-xl font-semibold tracking-wide text-white">Vaultio</span>
        </Link>

        {/* Wallet Connection */}
        <ConnectWalletButton />
      </div>
    </header>
  );
};
