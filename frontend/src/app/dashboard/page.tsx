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
  const [activeTab, setActiveTab] = useState<"lock" | "locks">("locks");

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
    <main className="bg-background min-h-screen">
      <Header />

      <div className="px-6 pt-24 pb-12">
        <div className="mx-auto max-w-5xl">
          {/* Wallet Greeting */}
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-2xl font-semibold md:text-3xl">
              <span className="text-white">Hi, this is your wallet address : </span>
              <span className="gradient-text">{shortenAddress(address)}</span>
            </h1>
            <p className="text-muted-foreground">Manage your secured assets with confidence.</p>
          </div>

          {/* Tab Navigation */}
          <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === "lock" ? (
              <LockTokensForm onLockSuccess={() => setActiveTab("locks")} />
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
