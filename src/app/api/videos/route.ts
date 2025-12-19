import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { logger } from "@/lib/logger";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

// GET /api/videos - List videos with pagination
// Excludes large base64 fields by default for performance
export async function GET(request: Request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limitParam = searchParams.get("limit");
    const includeFrames = searchParams.get("includeFrames") === "true";
    const limit = Math.min(
      parseInt(limitParam || String(DEFAULT_PAGE_SIZE), 10) ||
        DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE
    );

    const videos = await prisma.generatedVideo.findMany({
      where: { userId: user!.id },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        url: true,
        thumbnailUrl: true,
        prompt: true,
        model: true,
        duration: true,
        aspectRatio: true,
        resolution: true,
        audioEnabled: true,
        createdAt: true,
        // Only include large base64 fields if explicitly requested
        startImageUrl: includeFrames,
        endImageUrl: includeFrames,
      },
    });

    const hasMore = videos.length > limit;
    const data = hasMore ? videos.slice(0, -1) : videos;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    return NextResponse.json({
      data,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    logger.error("Failed to fetch videos", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

// POST /api/videos - Create a new video record
export async function POST(request: Request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const {
      url,
      thumbnailUrl,
      prompt,
      model,
      duration,
      aspectRatio,
      resolution,
      startImageUrl,
      endImageUrl,
      audioEnabled,
    } = body;

    if (!url || !prompt || !model) {
      return NextResponse.json(
        { error: "URL, prompt, and model are required" },
        { status: 400 }
      );
    }

    const video = await prisma.generatedVideo.create({
      data: {
        userId: user!.id,
        url,
        thumbnailUrl,
        prompt,
        model,
        duration: parseInt(duration) || 5,
        aspectRatio: aspectRatio || "16:9",
        resolution,
        startImageUrl,
        endImageUrl,
        audioEnabled: audioEnabled || false,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    logger.error("Failed to create video", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}
