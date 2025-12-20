import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import {
  encryptApiKey,
  decryptApiKey,
  maskApiKey,
} from "@/lib/services/apiKeyService";
import { logger } from "@/lib/logger";
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitHeaders,
  RATE_LIMITS,
} from "@/lib/rate-limit";

// GET /api/api-keys - List all API keys (masked)
export async function GET(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  // Rate limit sensitive operations
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await checkRateLimit(clientId, RATE_LIMITS.sensitive);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: "desc" },
    });

    // Decrypt and mask the actual key values for security
    const maskedKeys = apiKeys.map((key) => ({
      ...key,
      key: maskApiKey(decryptApiKey(key.key)),
    }));

    return NextResponse.json(maskedKeys);
  } catch (error) {
    logger.error("Failed to fetch API keys", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

// POST /api/api-keys - Create or update an API key
export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  // Rate limit sensitive operations
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await checkRateLimit(clientId, RATE_LIMITS.sensitive);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    const body = await request.json();
    const { name, key, service } = body;

    if (!name || !key || !service) {
      return NextResponse.json(
        { error: "Name, key, and service are required" },
        { status: 400 }
      );
    }

    // Encrypt the API key before storing
    const encryptedKey = encryptApiKey(key);

    // Upsert - create or update if service already exists for this user
    const apiKey = await prisma.apiKey.upsert({
      where: { userId_service: { userId: user!.id, service } },
      update: { name, key: encryptedKey, isActive: true },
      create: {
        userId: user!.id,
        name,
        key: encryptedKey,
        service,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        ...apiKey,
        key: maskApiKey(key), // Mask the original key for response
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Failed to save API key", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to save API key" },
      { status: 500 }
    );
  }
}

// DELETE /api/api-keys - Delete an API key by service
export async function DELETE(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  // Rate limit sensitive operations
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await checkRateLimit(clientId, RATE_LIMITS.sensitive);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get("service");

    if (!service) {
      return NextResponse.json(
        { error: "Service parameter is required" },
        { status: 400 }
      );
    }

    await prisma.apiKey.deleteMany({
      where: { userId: user!.id, service },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete API key", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
