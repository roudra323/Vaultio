"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { LockTokensForm } from "@/components/dashboard/LockTokensForm";
import { LocksTable } from "@/components/dashboard/LocksTable";

const DashboardPage = () => {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"lock" | "locks">("lock");

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected || !address) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          {/* Wallet Greeting */}
          <div className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">
              <span className="text-white">Hi, this is your wallet address : </span>
              <span className="gradient-text">{shortenAddress(address)}</span>
            </h1>
            <p className="text-muted-foreground">
              Manage your secured assets with confidence.
            </p>
          </div>

          {/* Tab Navigation */}
          <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === "lock" ? (
              <LockTokensForm />
            ) : (
              <LocksTable />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
