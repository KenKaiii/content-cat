import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { logger } from "@/lib/logger";

// DELETE /api/images/[id] - Delete an image
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;

    // Only delete if the image belongs to the user
    await prisma.generatedImage.deleteMany({
      where: { id, userId: user!.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete image", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
