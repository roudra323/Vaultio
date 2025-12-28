"use client";

import { cn } from "@/lib/utils";

type DashboardTabsProps = {
  activeTab: "lock" | "locks";
  onTabChange: (tab: "lock" | "locks") => void;
};

export const DashboardTabs = ({ activeTab, onTabChange }: DashboardTabsProps) => {
  return (
    <div className="flex justify-center gap-4">
      <button
        onClick={() => onTabChange("lock")}
        className={cn(
          "rounded-full px-8 py-3 text-sm font-medium transition-all duration-200",
          activeTab === "lock"
            ? "bg-secondary border-border border text-white"
            : "text-muted-foreground hover:bg-secondary/50 hover:text-white"
        )}>
        Lock Tokens
      </button>
      <button
        onClick={() => onTabChange("locks")}
        className={cn(
          "rounded-full px-8 py-3 text-sm font-medium transition-all duration-200",
          activeTab === "locks"
            ? "bg-secondary border-border border text-white"
            : "text-muted-foreground hover:bg-secondary/50 hover:text-white"
        )}>
        My Locks
      </button>
    </div>
  );
};
