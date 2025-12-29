/**
 * Common utility types used across the application
 */

/**
 * Duration option for lock duration selection
 */
export type DurationOption = {
    label: string;
    value: string;
};

/**
 * Props for components that accept children
 */
export type WithChildren = {
    children: React.ReactNode;
};

/**
 * Async function result type
 */
export type AsyncResult<T> = {
    data: T | null;
    error: Error | null;
    isLoading: boolean;
};
