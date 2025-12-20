import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { logger } from "@/lib/logger";

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

// GET /api/images - List images with pagination
export async function GET(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limitParam = searchParams.get("limit");
    const limit = Math.min(
      parseInt(limitParam || String(DEFAULT_PAGE_SIZE), 10) ||
        DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE
    );

    const images = await prisma.generatedImage.findMany({
      where: { userId: user!.id },
      take: limit + 1, // Fetch one extra to determine if there's more
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // Skip the cursor itself
      }),
      orderBy: { createdAt: "desc" },
    });

    const hasMore = images.length > limit;
    const data = hasMore ? images.slice(0, -1) : images;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    return NextResponse.json({
      data,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    logger.error("Failed to fetch images", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

// POST /api/images - Create a new image
export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { url, prompt, aspectRatio } = body;

    if (!url || !prompt) {
      return NextResponse.json(
        { error: "URL and prompt are required" },
        { status: 400 }
      );
    }

    const image = await prisma.generatedImage.create({
      data: {
        userId: user!.id,
        url,
        prompt,
        aspectRatio: aspectRatio || "1:1",
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    logger.error("Failed to create image", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to create image" },
      { status: 500 }
    );
  }
}
