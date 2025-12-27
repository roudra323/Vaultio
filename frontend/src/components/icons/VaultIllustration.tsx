"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type VaultIllustrationProps = {
  className?: string;
  interval?: number;
};

export const VaultIllustration = ({
  className,
  interval = 2000,
}: VaultIllustrationProps) => {
  const [isRotated, setIsRotated] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsRotated((prev) => !prev);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return (
    <div className={cn("relative w-[500px] h-[500px]", className)}>
      {/* Animated background glow - Purple (fades in/out) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-96 h-96 rounded-full blur-[120px] transition-opacity duration-1000"
          style={{
            backgroundColor: "#7F22FE",
            opacity: isRotated ? 0.25 : 0,
          }}
        />
      </div>

      {/* Animated background glow - Cyan (fades in/out opposite) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-80 h-80 rounded-full blur-[100px] transition-opacity duration-1000"
          style={{
            backgroundColor: "#2DBEE8",
            opacity: isRotated ? 0 : 0.2,
          }}
        />
      </div>

      {/* Floating sparkle - top */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 animate-subtle-pulse">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 0L12 7L20 10L12 13L10 20L8 13L0 10L8 7L10 0Z"
            fill="white"
            fillOpacity="0.9"
          />
        </svg>
      </div>

      {/* Floating sparkle - bottom right */}
      <div className="absolute bottom-32 right-24 animate-float-delayed">
        <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 0L12 7L20 10L12 13L10 20L8 13L0 10L8 7L10 0Z"
            fill="white"
            fillOpacity="0.6"
          />
        </svg>
      </div>

      {/* Left Pyramid - from Figma */}
      <div className="absolute left-[-70px] top-[350px] -translate-y-1/2">
        <Image
          src="/Pyramid.svg"
          alt=""
          width={55}
          height={70}
          className="opacity-60 -rotate-12"
        />
      </div>

      {/* Right Pyramid - from Figma (larger) */}
      <div className="absolute right-[-30px] top-[40px] -translate-y-1/2">
        <Image
          src="/Pyramid.svg"
          alt=""
          width={85}
          height={110}
          className="opacity-70 rotate-6"
        />
      </div>

      {/* Vault Image with rotation animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/vault.svg"
          alt="Vault"
          width={350}
          height={350}
          priority
          className={cn(
            "drop-shadow-2xl transition-transform duration-1000 ease-in-out",
            isRotated ? "rotate-2" : "-rotate-2"
          )}
        />
      </div>
    </div>
  );
};
