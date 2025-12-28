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
import { useVaultio, type Lock } from "@/hooks/useVaultio";
import { ethers } from "ethers";

export const LocksTable = () => {
  const { userLocks, isLoadingLocks, tokenDecimals } = useVaultio();
  const [selectedLock, setSelectedLock] = useState<{
    lock: Lock;
    index: number;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Update current time every second to check unlock status
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp: ethers.BigNumber) => {
    const date = new Date(timestamp.toNumber() * 1000);
    return (
      date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      }) +
      " | " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    );
  };

  const isUnlocked = (unlockTime: ethers.BigNumber) => {
    return currentTime >= unlockTime.toNumber() * 1000;
  };

  const getDecimalsForToken = (tokenAddress: string): number => {
    const normalizedAddress = tokenAddress.toLowerCase();
    return tokenDecimals[normalizedAddress] ?? 18;
  };

  const handleWithdrawClick = (lock: Lock, index: number) => {
    setSelectedLock({ lock, index });
  };

  const handleCloseModal = () => {
    setSelectedLock(null);
  };

  if (isLoadingLocks) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="border-vaultio-cyan h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (!userLocks || userLocks.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground text-lg">No locks found.</p>
        <p className="text-muted-foreground mt-2 text-sm">Lock some tokens to see them here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="vaultio-table overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Token Address</TableHead>
              <TableHead className="text-muted-foreground font-medium">Amount</TableHead>
              <TableHead className="text-muted-foreground font-medium">Start Time</TableHead>
              <TableHead className="text-muted-foreground font-medium">Unlock Time</TableHead>
              <TableHead className="text-muted-foreground font-medium">Status</TableHead>
              <TableHead className="text-muted-foreground text-right font-medium">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...userLocks].reverse().map((lock, reversedIndex) => {
              const index = userLocks.length - 1 - reversedIndex;
              const unlocked = isUnlocked(lock.unlockTime);
              const canWithdraw = unlocked && !lock.withdrawn;

              return (
                <TableRow key={index} className="border-border hover:bg-secondary/30">
                  <TableCell className="font-mono text-white">
                    {shortenAddress(lock.token)}
                  </TableCell>
                  <TableCell className="text-white">
                    {ethers.utils.formatUnits(lock.amount, getDecimalsForToken(lock.token))}
                  </TableCell>
                  <TableCell className="text-white">{formatDate(lock.startTime)}</TableCell>
                  <TableCell className="text-white">{formatDate(lock.unlockTime)}</TableCell>
                  <TableCell>
                    {lock.withdrawn ? (
                      <Badge variant="outline" className="status-withdrawn gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Withdrawn
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="status-locked gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Locked
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {canWithdraw && (
                      <button
                        onClick={() => handleWithdrawClick(lock, index)}
                        className="bg-vaultio-cyan hover:bg-vaultio-cyan-dark rounded-full px-5 py-2 text-sm font-medium text-white transition-colors">
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
          decimals={getDecimalsForToken(selectedLock.lock.token)}
        />
      )}
    </>
  );
};
