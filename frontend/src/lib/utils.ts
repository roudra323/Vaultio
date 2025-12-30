import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for merging Tailwind CSS classes
 * Combines clsx and tailwind-merge for optimal class handling
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
