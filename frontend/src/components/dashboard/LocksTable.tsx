"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { WithdrawModal } from "@/components/dashboard/WithdrawModal";
import { useVaultio } from "@/hooks/useVaultio";
import { formatAddress, formatDate, formatTokenAmount, isUnlocked } from "@/lib/utils";
import type { Lock, LockWithIndex } from "@/types";

export const LocksTable = () => {
  const { userLocks, isLoadingLocks } = useVaultio();
  const [selectedLock, setSelectedLock] = useState<LockWithIndex | null>(null);
  const [, setCurrentTime] = useState(() => Date.now());

  // Update current time every 5 seconds to trigger re-render and check unlock status
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleWithdrawClick = (lock: Lock, index: number) => {
    setSelectedLock({ lock, index });
  };

  const handleCloseModal = () => {
    setSelectedLock(null);
  };

  if (isLoadingLocks) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-vaultio-cyan border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!userLocks || userLocks.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">No locks found.</p>
        <p className="text-muted-foreground text-sm mt-2">
          Lock some tokens to see them here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="vaultio-table overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">
                Token Address
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Amount
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Start Time
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Unlock Time
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userLocks.map((lock, index) => {
              const unlocked = isUnlocked(lock.unlockTime);
              const canWithdraw = unlocked && !lock.withdrawn;

              return (
                <TableRow
                  key={index}
                  className="border-border hover:bg-secondary/30"
                >
                  <TableCell className="font-mono text-white">
                    {formatAddress(lock.token)}
                  </TableCell>
                  <TableCell className="text-white">
                    {formatTokenAmount(lock.amount)}
                  </TableCell>
                  <TableCell className="text-white">
                    {formatDate(lock.startTime)}
                  </TableCell>
                  <TableCell className="text-white">
                    {formatDate(lock.unlockTime)}
                  </TableCell>
                  <TableCell>
                    {lock.withdrawn ? (
                      <Badge
                        variant="outline"
                        className="status-withdrawn gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Withdrawn
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="status-locked gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Locked
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {canWithdraw && (
                      <button
                        onClick={() => handleWithdrawClick(lock, index)}
                        className="px-5 py-2 rounded-full bg-vaultio-cyan text-white font-medium text-sm hover:bg-vaultio-cyan-dark transition-colors"
                      >
                        Withdraw
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Withdraw Modal */}
      {selectedLock && (
        <WithdrawModal
          lock={selectedLock.lock}
          lockIndex={selectedLock.index}
          isOpen={!!selectedLock}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};
