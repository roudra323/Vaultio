"use client";

import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useVaultio, type Lock } from "@/hooks/useVaultio";
import { formatUnits } from "viem";

type WithdrawModalProps = {
  lock: Lock;
  lockIndex: number;
  isOpen: boolean;
  onClose: () => void;
};

export const WithdrawModal = ({ lock, lockIndex, isOpen, onClose }: WithdrawModalProps) => {
  const { withdrawTokens, isWithdrawing } = useVaultio();

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

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
            <DialogTitle className="text-xl font-semibold text-white">Withdraw Tokens</DialogTitle>
            <button
              onClick={onClose}
              className="hover:bg-secondary rounded-lg p-1 transition-colors"></button>
          </div>
          <DialogDescription className="text-muted-foreground">
            You are about to withdraw your locked tokens. This action will transfer the assets back
            to your wallet.
          </DialogDescription>
        </DialogHeader>

        {/* Token Details */}
        <div className="bg-secondary mt-4 space-y-3 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Token</span>
            <span className="font-medium text-white">ETH</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium text-white">{formatUnits(lock.amount, 18)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Address</span>
            <span className="font-mono font-medium text-white">{shortenAddress(lock.token)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isWithdrawing}
            className="text-muted-foreground px-6 py-2.5 font-medium transition-colors hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleConfirmWithdraw}
            disabled={isWithdrawing}
            className="bg-vaultio-cyan hover:bg-vaultio-cyan-dark flex items-center gap-2 rounded-full px-6 py-2.5 font-medium text-white transition-colors disabled:opacity-50">
            {isWithdrawing && <Loader2 className="h-4 w-4 animate-spin" />}
            {isWithdrawing ? "Withdrawing..." : "Confirm Withdrawal"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
