"use client";

import { X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useVaultio } from "@/hooks/useVaultio";
import { formatAddress, formatTokenAmount } from "@/lib/utils";
import type { Lock } from "@/types";

type WithdrawModalProps = {
  lock: Lock;
  lockIndex: number;
  isOpen: boolean;
  onClose: () => void;
};

export const WithdrawModal = ({
  lock,
  lockIndex,
  isOpen,
  onClose,
}: WithdrawModalProps) => {
  const { withdrawTokens, isWithdrawing } = useVaultio();

  const handleConfirmWithdraw = async () => {
    const success = await withdrawTokens(lockIndex);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-white">
              Withdraw Tokens
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <DialogDescription className="text-muted-foreground">
            You are about to withdraw your locked tokens. This action will
            transfer the assets back to your wallet.
          </DialogDescription>
        </DialogHeader>

        {/* Token Details */}
        <div className="mt-4 p-4 bg-secondary rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Token</span>
            <span className="text-white font-medium">ETH</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Amount</span>
            <span className="text-white font-medium">
              {formatTokenAmount(lock.amount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Address</span>
            <span className="text-white font-medium font-mono">
              {formatAddress(lock.token)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isWithdrawing}
            className="px-6 py-2.5 text-muted-foreground hover:text-white font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmWithdraw}
            disabled={isWithdrawing}
            className="px-6 py-2.5 rounded-full bg-vaultio-cyan text-white font-medium hover:bg-vaultio-cyan-dark transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isWithdrawing && <Loader2 className="w-4 h-4 animate-spin" />}
            {isWithdrawing ? "Withdrawing..." : "Confirm Withdrawal"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
