import { NextRequest, NextResponse } from "next/server";
import {
  createKling26Client,
  createKling25TurboClient,
  createWan26Client,
  parseFalError,
  type VideoModelId,
} from "@/lib/fal";
import { prisma } from "@/lib/prisma";
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

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireAuth(request);
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
        error: "Too many requests. Please wait before generating more videos.",
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
      model,
      mode,
      aspectRatio,
      duration,
      resolution,
      audioEnabled,
      enhanceEnabled,
      imageUrl,
      endImageUrl,
      negativePrompt,
      cfgScale,
      seed,
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
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

    const modelId = (model || "kling-2.6") as VideoModelId;

    // Log input for debugging (sanitized)
    logger.debug("Video generation request", {
      modelId,
      mode,
      aspectRatio,
      duration,
      audioEnabled,
      hasImageUrl: !!imageUrl,
      hasEndImageUrl: !!endImageUrl,
    });

    // Generate video with timeout protection
    const generateVideo = async (): Promise<{
      video: { url: string };
      seed?: number;
    }> => {
      switch (modelId) {
        case "kling-2.6": {
          const client = createKling26Client(apiKey);
          if (mode === "image-to-video" && imageUrl) {
            return client.generateImageToVideo({
              prompt,
              image_url: imageUrl,
              duration: duration as "5" | "10",
              generate_audio: audioEnabled ?? false,
              negative_prompt: negativePrompt,
              cfg_scale: cfgScale ?? 0.5,
              seed,
            });
          } else {
            return client.generateTextToVideo({
              prompt,
              aspect_ratio: aspectRatio as "16:9" | "9:16" | "1:1",
              duration: duration as "5" | "10",
              generate_audio: audioEnabled ?? false,
              negative_prompt: negativePrompt,
              cfg_scale: cfgScale ?? 0.5,
              seed,
            });
          }
        }

        case "kling-2.5-turbo": {
          const client = createKling25TurboClient(apiKey);
          if (mode === "image-to-video" && imageUrl) {
            return client.generateImageToVideo({
              prompt,
              image_url: imageUrl,
              duration: duration as "5" | "10",
              negative_prompt: negativePrompt,
              cfg_scale: cfgScale ?? 0.5,
              tail_image_url: endImageUrl,
              seed,
            });
          } else {
            return client.generateTextToVideo({
              prompt,
              aspect_ratio: aspectRatio as "16:9" | "9:16" | "1:1",
              duration: duration as "5" | "10",
              negative_prompt: negativePrompt,
              cfg_scale: cfgScale ?? 0.5,
              seed,
            });
          }
        }

        case "wan-2.6": {
          const client = createWan26Client(apiKey);
          if (mode === "image-to-video" && imageUrl) {
            return client.generateImageToVideo({
              prompt,
              image_url: imageUrl,
              duration: duration as "5" | "10" | "15",
              resolution: resolution as "720p" | "1080p",
              enable_prompt_expansion: enhanceEnabled ?? false,
              negative_prompt: negativePrompt,
              seed,
            });
          } else {
            return client.generateTextToVideo({
              prompt,
              aspect_ratio: aspectRatio as
                | "16:9"
                | "9:16"
                | "1:1"
                | "4:3"
                | "3:4",
              duration: duration as "5" | "10" | "15",
              resolution: resolution as "720p" | "1080p",
              enable_prompt_expansion: enhanceEnabled ?? false,
              negative_prompt: negativePrompt,
              seed,
            });
          }
        }

        default:
          throw new Error(`Unknown model: ${modelId}`);
      }
    };

    const result = await withTimeout(
      generateVideo(),
      TIMEOUTS.VIDEO_GENERATION,
      "Video generation timed out. Please try again."
    );

    // Save the video to the database
    const video = await prisma.generatedVideo.create({
      data: {
        userId: user!.id,
        url: result.video.url,
        prompt,
        model: modelId,
        duration: parseInt(duration) || 5,
        aspectRatio: aspectRatio || "16:9",
        resolution,
        startImageUrl: imageUrl,
        endImageUrl,
        audioEnabled: audioEnabled || false,
      },
    });

    return NextResponse.json({
      success: true,
      video: video, // Return the full database record
      videoUrl: result.video.url,
      seed: result.seed,
      id: video.id,
    });
  } catch (error: unknown) {
    logger.error("Video generation error", {
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
      error instanceof Error ? error.message : "Failed to generate video";
    const parsed = parseFalError(errorMsg);
    return NextResponse.json(parsed, { status: 500 });
  }
}
