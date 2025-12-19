/**
 * Encryption utilities for sensitive data at rest
 * Uses AES-256-GCM for authenticated encryption
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Get or derive encryption key from environment
 * In production, use a proper key management service (AWS KMS, HashiCorp Vault, etc.)
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;

  if (envKey) {
    // If a 64-char hex key is provided, use it directly
    if (envKey.length === 64) {
      return Buffer.from(envKey, "hex");
    }
    // Otherwise derive a key from the provided string
    return crypto.scryptSync(envKey, "content-cat-salt", 32);
  }

  // Fallback to deriving from a combination of available secrets
  // This is NOT recommended for production - always set ENCRYPTION_KEY
  const fallbackSecret =
    process.env.SESSION_SECRET ||
    process.env.DATABASE_URL ||
    "default-insecure-key-change-me";

  console.warn(
    "WARNING: Using derived encryption key. Set ENCRYPTION_KEY in production."
  );

  return crypto.scryptSync(fallbackSecret, "content-cat-derived", 32);
}

/**
 * Encrypt a string value
 * Returns base64-encoded ciphertext with IV and auth tag
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let ciphertext = cipher.update(plaintext, "utf8", "base64");
  ciphertext += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  // Combine IV + authTag + ciphertext, all base64 encoded
  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(ciphertext, "base64"),
  ]);

  return combined.toString("base64");
}

/**
 * Decrypt a string value
 * Expects base64-encoded ciphertext with IV and auth tag
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedData, "base64");

  // Extract IV, auth tag, and ciphertext
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let plaintext = decipher.update(ciphertext);
  plaintext = Buffer.concat([plaintext, decipher.final()]);

  return plaintext.toString("utf8");
}

/**
 * Check if a value appears to be encrypted (base64 with correct length)
 */
export function isEncrypted(value: string): boolean {
  try {
    const decoded = Buffer.from(value, "base64");
    // Minimum size: IV (16) + AuthTag (16) + at least 1 byte of data
    return decoded.length >= IV_LENGTH + AUTH_TAG_LENGTH + 1;
  } catch {
    return false;
  }
}

/**
 * Hash a value for comparison (one-way)
 * Useful for storing API key hashes for lookup
 */
export function hashForLookup(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}
