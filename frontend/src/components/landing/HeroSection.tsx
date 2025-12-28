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
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20 pb-12">
      {/* Background gradient effects */}
      <div className="bg-vaultio-purple/10 absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-3xl" />
      <div className="bg-vaultio-cyan/10 absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full blur-3xl" />

      {/* Vault Illustration */}
      <div className="relative z-10 mb-8">
        <VaultIllustration className="h-[350px] w-[350px] md:h-[400px] md:w-[400px]" />
      </div>

      {/* Hero Text */}
      <div className="relative z-10 max-w-3xl text-center">
        <h1 className="mb-2 text-4xl leading-tight font-bold text-white md:text-5xl lg:text-6xl">
          Secure Token Locking
        </h1>
        <h2 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
          <span className="text-white">With </span>
          <span className="gradient-text">Confidence</span>
        </h2>

        <p className="text-muted-foreground mx-auto mb-10 max-w-xl text-base leading-relaxed md:text-lg">
          Lock, manage, and withdraw assets through a transparent on-chain vault. The most trusted
          protocol for asset security.
        </p>

        {/* CTA Button */}
        <div className="flex justify-center">
          {isConnected ? (
            <button
              onClick={handleGetStarted}
              className="from-vaultio-purple to-vaultio-cyan hover:shadow-vaultio-purple/30 flex transform items-center gap-2 rounded-full bg-linear-to-r px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
              Go to Dashboard
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <ConnectWalletButton />
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="from-background absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t to-transparent" />
    </section>
  );
};
