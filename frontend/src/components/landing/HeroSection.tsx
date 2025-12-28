"use client";

import { ChevronRight } from "lucide-react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { VaultIllustration } from "@/components/icons";
import { ConnectWalletButton } from "@/components/wallet";

export const HeroSection = () => {
  const { isConnected } = useAccount();
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/dashboard");
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-vaultio-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-vaultio-cyan/10 rounded-full blur-3xl" />

      {/* Vault Illustration */}
      <div className="relative z-10 mb-8">
        <VaultIllustration className="w-[350px] h-[350px] md:w-[400px] md:h-[400px]" />
      </div>

      {/* Hero Text */}
      <div className="relative z-10 text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-2">
          Secure Token Locking
        </h1>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          <span className="text-white">With </span>
          <span className="gradient-text">Confidence</span>
        </h2>

        <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Lock, manage, and withdraw assets through a transparent on-chain
          vault. The most trusted protocol for asset security.
        </p>

        {/* CTA Button */}
        <div className="flex justify-center">
          {isConnected ? (
            <button
              onClick={handleGetStarted}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-linear-to-r from-vaultio-purple to-vaultio-cyan text-white font-semibold text-base hover:shadow-lg hover:shadow-vaultio-purple/30 transition-all duration-300 transform hover:scale-105"
            >
              Go to Dashboard
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <ConnectWalletButton />
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
    </section>
  );
};
