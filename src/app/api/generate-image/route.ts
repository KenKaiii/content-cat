import { NextRequest, NextResponse } from "next/server";
import {
  createNanoBananaProClient,
  parseFalError,
  type NanoBananaProAspectRatio,
  type NanoBananaProResolution,
  type NanoBananaProOutputFormat,
} from "@/lib/fal";
import { getApiKey } from "@/lib/services/apiKeyService";
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitHeaders,
  RATE_LIMITS,
} from "@/lib/rate-limit";
import { withTimeout, TIMEOUTS, TimeoutError } from "@/lib/utils/timeout";
import { requireAuth } from "@/lib/auth-helpers";
import { logger } from "@/lib/logger";
import { resolveImageForFal } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireAuth();
  if (authError) return authError;

  // Rate limiting for expensive generation operations
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await checkRateLimit(
    clientId,
    RATE_LIMITS.generation
  );

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Too many requests. Please wait before generating more images.",
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }

  try {
    const body = await request.json();
    const {
      prompt,
      aspectRatio,
      resolution,
      outputFormat,
      imageUrls,
      numImages,
      enableWebSearch,
      enableSafetyChecker,
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Resolve local file URLs to base64 for FAL.ai
    // (FAL.ai can't access our local /api/files/ URLs)
    const resolvedImageUrls: string[] = [];
    if (imageUrls && Array.isArray(imageUrls)) {
      for (const url of imageUrls) {
        const resolved = await resolveImageForFal(url);
        if (resolved) {
          resolvedImageUrls.push(resolved);
        }
      }
    }

    // Validate image sizes (max ~5MB base64 per image)
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    for (const url of resolvedImageUrls) {
      if (url && url.length > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          {
            error:
              "Reference image is too large. Please use a smaller image (max 5MB).",
          },
          { status: 400 }
        );
      }
    }

    const apiKey = await getApiKey(user!.id);
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "No API key. Add your fal.ai key in Settings.",
          code: "NO_API_KEY",
        },
        { status: 400 }
      );
    }

    const client = createNanoBananaProClient(apiKey);

    // Check if this is an edit request (has image URLs)
    const hasImages = resolvedImageUrls.length > 0;

    if (hasImages) {
      // Image editing mode with reference images (with timeout)
      const result = await withTimeout(
        client.editImage({
          prompt,
          image_urls: resolvedImageUrls,
          aspect_ratio: (aspectRatio || "auto") as NanoBananaProAspectRatio,
          resolution: (resolution || "1K") as NanoBananaProResolution,
          output_format: (outputFormat || "png") as NanoBananaProOutputFormat,
          num_images: numImages || 1,
          enable_safety_checker: enableSafetyChecker ?? true,
        }),
        TIMEOUTS.IMAGE_GENERATION,
        "Image generation timed out. Please try again."
      );

      return NextResponse.json({
        success: true,
        images: result.images,
        resultUrls: result.images.map((img) => img.url),
        description: result.description,
        seed: result.seed,
      });
    } else {
      // Text-to-image mode (with timeout)
      const result = await withTimeout(
        client.generateImage({
          prompt,
          aspect_ratio: (aspectRatio || "1:1") as NanoBananaProAspectRatio,
          resolution: (resolution || "1K") as NanoBananaProResolution,
          output_format: (outputFormat || "png") as NanoBananaProOutputFormat,
          num_images: numImages || 1,
          enable_web_search: enableWebSearch ?? false,
          enable_safety_checker: enableSafetyChecker ?? true,
        }),
        TIMEOUTS.IMAGE_GENERATION,
        "Image generation timed out. Please try again."
      );

      return NextResponse.json({
        success: true,
        images: result.images,
        resultUrls: result.images.map((img) => img.url),
        description: result.description,
        seed: result.seed,
      });
    }
  } catch (error) {
    logger.error("Image generation error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // Handle timeout errors specifically
    if (error instanceof TimeoutError) {
      return NextResponse.json(
        { error: error.message, code: "TASK_TIMEOUT" },
        { status: 504 }
      );
    }

    const errorMsg =
      error instanceof Error ? error.message : "Failed to generate image";
    const parsed = parseFalError(errorMsg);
    return NextResponse.json(parsed, { status: 500 });
  }
}
