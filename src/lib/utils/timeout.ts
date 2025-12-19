/**
 * Timeout utilities for async operations
 */

export class TimeoutError extends Error {
  constructor(message: string = "Operation timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * Wraps a promise with a timeout
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Custom error message
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new TimeoutError(
          errorMessage || `Operation timed out after ${timeoutMs}ms`
        )
      );
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

/**
 * Default timeout values for different operation types
 */
export const TIMEOUTS = {
  // Image generation: 2 minutes
  IMAGE_GENERATION: 2 * 60 * 1000,
  // Video generation: 10 minutes (can be slow)
  VIDEO_GENERATION: 10 * 60 * 1000,
  // Database operations: 30 seconds
  DATABASE: 30 * 1000,
  // External API calls: 30 seconds
  EXTERNAL_API: 30 * 1000,
  // File upload: 5 minutes
  FILE_UPLOAD: 5 * 60 * 1000,
} as const;
