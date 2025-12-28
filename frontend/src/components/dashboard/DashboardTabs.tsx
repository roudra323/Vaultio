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
          "px-8 py-3 rounded-full font-medium text-sm transition-all duration-200",
          activeTab === "lock"
            ? "bg-secondary text-white border border-border"
            : "text-muted-foreground hover:text-white hover:bg-secondary/50"
        )}
      >
        Lock Tokens
      </button>
      <button
        onClick={() => onTabChange("locks")}
        className={cn(
          "px-8 py-3 rounded-full font-medium text-sm transition-all duration-200",
          activeTab === "locks"
            ? "bg-secondary text-white border border-border"
            : "text-muted-foreground hover:text-white hover:bg-secondary/50"
        )}
      >
        My Locks
      </button>
    </div>
  );
};

