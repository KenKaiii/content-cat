/**
 * Rate limiter with Redis support and in-memory fallback
 * Uses Redis in production for multi-instance support
 */

import { Redis } from "ioredis";
import { logger } from "./logger";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  // Maximum requests allowed in the window
  limit: number;
  // Time window in milliseconds
  windowMs: number;
}

// Redis client singleton (lazy initialized)
let redisClient: Redis | null = null;
let redisAvailable = true;

function getRedisClient(): Redis | null {
  if (!redisAvailable) return null;

  if (!redisClient && process.env.REDIS_URL) {
    try {
      redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 3) {
            redisAvailable = false;
            logger.warn(
              "Redis unavailable, falling back to in-memory rate limiting"
            );
            return null;
          }
          return Math.min(times * 100, 3000);
        },
      });

      redisClient.on("error", () => {
        // Silently handle - retryStrategy handles logging
      });
    } catch {
      redisAvailable = false;
      logger.warn("Failed to initialize Redis, using in-memory rate limiting");
    }
  }

  return redisClient;
}

// In-memory store fallback (cleared on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (for in-memory fallback)
const CLEANUP_INTERVAL = 60000; // 1 minute
const MAX_MEMORY_ENTRIES = 10000; // Prevent unbounded growth
let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
    // Evict oldest entries if over limit (LRU-like behavior)
    if (rateLimitStore.size > MAX_MEMORY_ENTRIES) {
      const entries = Array.from(rateLimitStore.entries());
      entries.sort((a, b) => a[1].resetTime - b[1].resetTime);
      const toDelete = entries.slice(0, entries.length - MAX_MEMORY_ENTRIES);
      toDelete.forEach(([key]) => rateLimitStore.delete(key));
    }
  }, CLEANUP_INTERVAL);
  // Don't prevent process exit
  cleanupTimer.unref();
}

// Preset configurations for different endpoint types
export const RATE_LIMITS = {
  // Expensive operations (AI generation)
  generation: { limit: 10, windowMs: 60000 }, // 10 per minute
  // Standard API operations
  standard: { limit: 100, windowMs: 60000 }, // 100 per minute
  // Read-heavy operations
  read: { limit: 200, windowMs: 60000 }, // 200 per minute
  // Sensitive operations (API keys, auth)
  sensitive: { limit: 20, windowMs: 60000 }, // 20 per minute
} as const;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request should be rate limited (Redis with in-memory fallback)
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result with headers info
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redis = getRedisClient();

  if (redis && redisAvailable) {
    try {
      return await checkRateLimitRedis(redis, identifier, config);
    } catch {
      // Fall through to in-memory on Redis error
    }
  }

  return checkRateLimitMemory(identifier, config);
}

/**
 * Redis-based rate limiting using sliding window
 */
async function checkRateLimitRedis(
  redis: Redis,
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}:${config.limit}:${config.windowMs}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Use Redis sorted set for sliding window
  const pipe = redis.pipeline();
  pipe.zremrangebyscore(key, 0, windowStart); // Remove old entries
  pipe.zadd(key, now, `${now}-${Math.random()}`); // Add current request
  pipe.zcard(key); // Count requests in window
  pipe.pexpire(key, config.windowMs); // Set expiry

  const results = await pipe.exec();
  const count = (results?.[2]?.[1] as number) || 0;

  const resetTime = now + config.windowMs;
  const remaining = Math.max(0, config.limit - count);

  return {
    success: count <= config.limit,
    limit: config.limit,
    remaining,
    resetTime,
  };
}

/**
 * In-memory rate limiting fallback
 */
function checkRateLimitMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  startCleanup();

  const now = Date.now();
  const key = `${identifier}:${config.limit}:${config.windowMs}`;
  const entry = rateLimitStore.get(key);

  // If no entry or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header if behind proxy, falls back to connection IP
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }

  // Fallback to a generic identifier if no IP available
  // In production, you'd want to ensure proper IP forwarding
  return "unknown";
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.resetTime / 1000).toString(),
  };
}
