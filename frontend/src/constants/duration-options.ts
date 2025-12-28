/**
 * Lock duration options for the UI
 */
export type DurationOption = {
  /** Display label */
  label: string;
  /** Value in minutes */
  value: string;
};

/**
 * Predefined lock duration options
 */
export const DURATION_OPTIONS: DurationOption[] = [
  { label: "10 mins", value: "10" },
  { label: "30 mins", value: "30" },
  { label: "1 hour", value: "60" },
  { label: "6 hours", value: "360" },
  { label: "12 hours", value: "720" },
  { label: "1 day", value: "1440" },
  { label: "7 days", value: "10080" },
  { label: "30 days", value: "43200" },
] as const;

/**
 * Default duration value (in minutes)
 */
export const DEFAULT_DURATION = "10";

/**
 * Convert minutes to human-readable format
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? "s" : ""}`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""}`;
};

