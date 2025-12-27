import { cn } from "@/lib/utils";

type VaultioLogoProps = {
  className?: string;
  size?: number;
};

export const VaultioLogo = ({ className, size = 32 }: VaultioLogoProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(className)}
  >
    <rect width="32" height="32" rx="8" fill="url(#vaultio-logo-gradient)" />
    <rect
      x="0.627"
      y="0.627"
      width="30.746"
      height="30.746"
      rx="7.373"
      stroke="url(#vaultio-logo-stroke)"
      strokeWidth="1.254"
    />
    <path
      d="M22.33 9.67L10.59 21.41C10.15 21.85 9.41 21.79 9.05 21.27C7.81 19.46 7.08 17.32 7.08 15.12V10.73C7.08 9.91 7.7 8.98 8.46 8.67L14.03 6.39C15.29 5.87 16.69 5.87 17.95 6.39L22 8.04C22.66 8.31 22.83 9.17 22.33 9.67Z"
      fill="white"
    />
    <path
      d="M23.27 11.04C23.92 10.49 24.91 10.96 24.91 11.81V15.12C24.91 20.01 21.36 24.59 16.51 25.93C16.18 26.02 15.82 26.02 15.48 25.93C14.06 25.53 12.74 24.86 11.61 23.98C11.13 23.61 11.08 22.91 11.5 22.48C13.68 20.25 20.06 13.75 23.27 11.04Z"
      fill="white"
    />
    <defs>
      {/* radial-gradient(111.58% 100% at 50% 0%, #7F22FE 0%, #2DBEE8 100%) */}
      <radialGradient
        id="vaultio-logo-gradient"
        cx="0.5"
        cy="0"
        r="1.1158"
        gradientUnits="objectBoundingBox"
      >
        <stop offset="0%" stopColor="#7F22FE" />
        <stop offset="100%" stopColor="#2DBEE8" />
      </radialGradient>
      <radialGradient
        id="vaultio-logo-stroke"
        cx="0.5"
        cy="0"
        r="1"
        gradientUnits="objectBoundingBox"
      >
        <stop stopColor="#B9DCFF" />
        <stop offset="1" stopColor="#8E51FF" />
      </radialGradient>
    </defs>
  </svg>
);
