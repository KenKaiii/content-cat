import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, isEncrypted } from "@/lib/encryption";
import { logger } from "@/lib/logger";

/**
 * Encrypt an API key for storage
 */
export function encryptApiKey(plainKey: string): string {
  return encrypt(plainKey);
}

/**
 * Decrypt an API key from storage
 * Handles both encrypted and legacy plaintext keys
 */
export function decryptApiKey(storedKey: string): string {
  if (isEncrypted(storedKey)) {
    try {
      return decrypt(storedKey);
    } catch (error) {
      logger.error("Failed to decrypt API key, returning as-is", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return storedKey;
    }
  }
  // Legacy plaintext key
  return storedKey;
}

/**
 * Mask an API key for display (showing first 8 and last 4 chars)
 */
export function maskApiKey(key: string): string {
  if (key.length <= 12) {
    return key.slice(0, 4) + "...";
  }
  return key.slice(0, 8) + "..." + key.slice(-4);
}

/**
 * Get API key from database for a given user and service
 * @param userId - The user ID
 * @param service - The service name (default: "fal")
 * @returns The API key if found and active, null otherwise
 */
export async function getApiKey(
  userId: string,
  service: string = "fal"
): Promise<string | null> {
  try {
    const storedKey = await prisma.apiKey.findUnique({
      where: { userId_service: { userId, service } },
    });
    if (storedKey?.isActive && storedKey.key) {
      return decryptApiKey(storedKey.key);
    }
  } catch (error) {
    logger.error("Failed to fetch API key from database", {
      service,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
  return null;
}

/**
 * Check if an API key exists and is active for a given user and service
 * Uses a more efficient query that doesn't fetch the full key
 * @param userId - The user ID
 * @param service - The service name (default: "fal")
 * @returns True if key exists and is active
 */
export async function hasActiveApiKey(
  userId: string,
  service: string = "fal"
): Promise<boolean> {
  try {
    const count = await prisma.apiKey.count({
      where: { userId, service, isActive: true },
    });
    return count > 0;
  } catch {
    return false;
  }
}
