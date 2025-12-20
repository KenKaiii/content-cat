import { NextResponse } from "next/server";
import { fal, configureFalClient } from "@/lib/fal";
import { logger } from "@/lib/logger";
import { requireAuth } from "@/lib/auth-helpers";

// POST /api/api-keys/validate - Validate an API key
export async function POST(request: Request) {
  // Require authentication to validate keys
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { key, service } = body;

    if (!key || !service) {
      return NextResponse.json(
        { error: "Key and service are required" },
        { status: 400 }
      );
    }

    let isValid = false;
    let message = "Unknown service";

    if (service === "fal") {
      // Validate fal.ai API key by checking authentication
      try {
        configureFalClient(key);

        // Try to get queue status for a non-existent request
        // This will fail with auth error if key is invalid
        // but succeed (with not found) if key is valid
        await fal.queue.status("fal-ai/nano-banana-pro", {
          requestId: "test-validation-request",
        });

        // If we get here without auth error, the key is valid
        isValid = true;
        message = "API key is valid";
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message.toLowerCase() : "";

        // Check for authentication errors
        if (
          errorMsg.includes("401") ||
          errorMsg.includes("unauthorized") ||
          errorMsg.includes("authentication") ||
          errorMsg.includes("invalid")
        ) {
          isValid = false;
          message = "API key is invalid. Double-check and try again.";
        } else if (
          errorMsg.includes("not found") ||
          errorMsg.includes("404") ||
          errorMsg.includes("request_id")
        ) {
          // Not found error means auth succeeded but request doesn't exist
          isValid = true;
          message = "API key is valid";
        } else if (
          errorMsg.includes("network") ||
          errorMsg.includes("fetch") ||
          errorMsg.includes("econnrefused")
        ) {
          isValid = false;
          message = "Connection failed. Check your internet.";
        } else {
          // Other errors might indicate the key is valid but something else failed
          isValid = true;
          message = "API key appears valid";
        }
      }
    }

    return NextResponse.json({ isValid, message });
  } catch (error) {
    logger.error("Failed to validate API key", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to validate API key" },
      { status: 500 }
    );
  }
}
