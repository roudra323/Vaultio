"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVaultio } from "@/hooks/useVaultio";
import { Loader2 } from "lucide-react";

const DURATION_OPTIONS = [
  { label: "10 mins", value: "10" },
  { label: "30 mins", value: "30" },
  { label: "1 hour", value: "60" },
  { label: "6 hours", value: "360" },
  { label: "12 hours", value: "720" },
  { label: "1 day", value: "1440" },
  { label: "7 days", value: "10080" },
  { label: "30 days", value: "43200" },
];

export const LockTokensForm = () => {
  const [tokenAddress, setTokenAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("10");
  const [step, setStep] = useState<"approve" | "lock">("approve");
  const [isApproved, setIsApproved] = useState(false);

  const {
    approveTokens,
    lockTokens,
    isApproving,
    isLocking,
    checkAllowance,
  } = useVaultio();

  // Check allowance when token address or amount changes
  useEffect(() => {
    const checkApproval = async () => {
      if (tokenAddress && amount && parseFloat(amount) > 0) {
        const needsApproval = await checkAllowance(tokenAddress, amount);
        setIsApproved(!needsApproval);
        setStep(needsApproval ? "approve" : "lock");
      } else {
        setIsApproved(false);
        setStep("approve");
      }
    };
    checkApproval();
  }, [tokenAddress, amount, checkAllowance]);

  const handleApprove = async () => {
    if (!tokenAddress || !amount) return;

    const success = await approveTokens(tokenAddress, amount);
    if (success) {
      setIsApproved(true);
      setStep("lock");
    }
  };

  const handleLock = async () => {
    if (!tokenAddress || !amount || !duration) return;

    const success = await lockTokens(tokenAddress, amount, parseInt(duration));
    if (success) {
      // Reset form
      setTokenAddress("");
      setAmount("");
      setDuration("10");
      setStep("approve");
      setIsApproved(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === "approve") {
      await handleApprove();
    } else {
      await handleLock();
    }
  };

  const isLoading = isApproving || isLocking;
  const isValid = tokenAddress && amount && parseFloat(amount) > 0;
  
  const buttonText = isApproving
    ? "Approving..."
    : isLocking
    ? "Locking..."
    : step === "approve"
    ? "Approve Tokens"
    : "Lock Tokens";

  return (
    <div className="max-w-xl mx-auto">
      <div className="vaultio-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token Address */}
          <div className="space-y-2">
            <Label htmlFor="tokenAddress" className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Token Address
            </Label>
            <Input
              id="tokenAddress"
              type="text"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              className="bg-secondary border-border text-white placeholder:text-muted-foreground focus:border-vaultio-cyan focus:ring-vaultio-cyan/20"
            />
          </div>

          {/* Amount and Duration Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-secondary border-border text-white placeholder:text-muted-foreground focus:border-vaultio-cyan focus:ring-vaultio-cyan/20"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Duration
              </Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-secondary border-border text-white focus:border-vaultio-cyan focus:ring-vaultio-cyan/20">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {DURATION_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-white hover:bg-secondary focus:bg-secondary"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Progress indicator */}
          {isValid && (
            <div className="flex items-center gap-4 text-sm">
              <div className={`flex items-center gap-2 ${step === "approve" ? "text-vaultio-cyan" : "text-muted-foreground"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isApproved ? "bg-vaultio-cyan text-white" : step === "approve" ? "border-2 border-vaultio-cyan" : "border border-muted-foreground"
                }`}>
                  {isApproved ? "✓" : "1"}
                </div>
                <span>Approve</span>
              </div>
              <div className="flex-1 h-px bg-border" />
              <div className={`flex items-center gap-2 ${step === "lock" ? "text-vaultio-cyan" : "text-muted-foreground"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === "lock" ? "border-2 border-vaultio-cyan" : "border border-muted-foreground"
                }`}>
                  2
                </div>
                <span>Lock</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full py-4 rounded-full bg-gradient-to-r from-vaultio-purple to-vaultio-cyan text-white font-semibold text-base hover:shadow-lg hover:shadow-vaultio-purple/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {buttonText}
          </button>
        </form>
      </div>
    </div>
  );
};
