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

// Convert Chosen Duration to Minutes for the contract
const DURATION_OPTIONS = [
  { label: "1 min", value: "1" },
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
  const [duration, setDuration] = useState("1");
  const [step, setStep] = useState<"approve" | "lock">("approve");
  const [isApproved, setIsApproved] = useState(false);

  const { approveTokens, lockTokens, isApproving, isLocking, checkAllowance } = useVaultio();

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
    <div className="mx-auto max-w-xl">
      <div className="vaultio-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token Address */}
          <div className="space-y-2">
            <Label
              htmlFor="tokenAddress"
              className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              Token Address
            </Label>
            <Input
              id="tokenAddress"
              type="text"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              className="bg-secondary border-border placeholder:text-muted-foreground focus:border-vaultio-cyan focus:ring-vaultio-cyan/20 text-white"
            />
          </div>

          {/* Amount and Duration Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label
                htmlFor="amount"
                className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
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
                className="bg-secondary border-border placeholder:text-muted-foreground focus:border-vaultio-cyan focus:ring-vaultio-cyan/20 text-white"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label
                htmlFor="duration"
                className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                Duration
              </Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-secondary border-border focus:border-vaultio-cyan focus:ring-vaultio-cyan/20 text-white">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {DURATION_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="hover:bg-secondary focus:bg-secondary text-white">
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
              <div
                className={`flex items-center gap-2 ${step === "approve" ? "text-vaultio-cyan" : "text-muted-foreground"}`}>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isApproved
                      ? "bg-vaultio-cyan text-white"
                      : step === "approve"
                        ? "border-vaultio-cyan border-2"
                        : "border-muted-foreground border"
                  }`}>
                  {isApproved ? "✓" : "1"}
                </div>
                <span>Approve</span>
              </div>
              <div className="bg-border h-px flex-1" />
              <div
                className={`flex items-center gap-2 ${step === "lock" ? "text-vaultio-cyan" : "text-muted-foreground"}`}>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    step === "lock"
                      ? "border-vaultio-cyan border-2"
                      : "border-muted-foreground border"
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
            className="from-vaultio-purple to-vaultio-cyan hover:shadow-vaultio-purple/30 flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r py-4 text-base font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50">
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            {buttonText}
          </button>
        </form>
      </div>
    </div>
  );
};
