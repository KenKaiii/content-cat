import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { logger } from "@/lib/logger";

export type EntityType = "character" | "product";

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// GET handler - List all entities for the current user
export function createListHandler(entityType: EntityType) {
  return async function GET() {
    const { user, error } = await requireAuth();
    if (error) return error;

    try {
      const entities =
        entityType === "character"
          ? await prisma.character.findMany({
              where: { userId: user!.id },
              orderBy: { createdAt: "desc" },
            })
          : await prisma.product.findMany({
              where: { userId: user!.id },
              orderBy: { createdAt: "desc" },
            });

      return NextResponse.json(entities);
    } catch (error) {
      logger.error(`Failed to fetch ${entityType}s`, {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return NextResponse.json(
        { error: `Failed to fetch ${entityType}s` },
        { status: 500 }
      );
    }
  };
}

// POST handler - Create a new entity for the current user
export function createCreateHandler(entityType: EntityType) {
  return async function POST(request: Request) {
    const { user, error } = await requireAuth();
    if (error) return error;

    try {
      const body = await request.json();
      const { name, referenceImages } = body;

      if (!name || !referenceImages || referenceImages.length === 0) {
        return NextResponse.json(
          { error: "Name and at least one reference image are required" },
          { status: 400 }
        );
      }

      const data = {
        userId: user!.id,
        name,
        referenceImages,
        thumbnailUrl: referenceImages[0],
      };

      const entity =
        entityType === "character"
          ? await prisma.character.create({ data })
          : await prisma.product.create({ data });

      return NextResponse.json(entity, { status: 201 });
    } catch (error) {
      logger.error(`Failed to create ${entityType}`, {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return NextResponse.json(
        { error: `Failed to create ${entityType}` },
        { status: 500 }
      );
    }
  };
}

// GET by ID handler - Only return if belongs to current user
export function createGetByIdHandler(entityType: EntityType) {
  return async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { user, error } = await requireAuth();
    if (error) return error;

    try {
      const { id } = await params;
      const entity =
        entityType === "character"
          ? await prisma.character.findFirst({
              where: { id, userId: user!.id },
            })
          : await prisma.product.findFirst({ where: { id, userId: user!.id } });

      if (!entity) {
        return NextResponse.json(
          { error: `${capitalizeFirst(entityType)} not found` },
          { status: 404 }
        );
      }

      return NextResponse.json(entity);
    } catch (error) {
      logger.error(`Failed to fetch ${entityType}`, {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return NextResponse.json(
        { error: `Failed to fetch ${entityType}` },
        { status: 500 }
      );
    }
  };
}

// DELETE handler - Only delete if belongs to current user
export function createDeleteHandler(entityType: EntityType) {
  return async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { user, error } = await requireAuth();
    if (error) return error;

    try {
      const { id } = await params;
      if (entityType === "character") {
        await prisma.character.deleteMany({ where: { id, userId: user!.id } });
      } else {
        await prisma.product.deleteMany({ where: { id, userId: user!.id } });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      logger.error(`Failed to delete ${entityType}`, {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return NextResponse.json(
        { error: `Failed to delete ${entityType}` },
        { status: 500 }
      );
    }
  };
}

// PATCH handler - Update entity only if belongs to current user
// Uses atomic update with ownership check to prevent race conditions
export function createUpdateHandler(entityType: EntityType) {
  return async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { user, error } = await requireAuth();
    if (error) return error;

    try {
      const { id } = await params;
      const body = await request.json();
      const { name, referenceImages } = body;

      const updateData: {
        name?: string;
        referenceImages?: string[];
        thumbnailUrl?: string;
      } = {};
      if (name) updateData.name = name;
      if (referenceImages) {
        updateData.referenceImages = referenceImages;
        updateData.thumbnailUrl = referenceImages[0];
      }

      // Atomic update with ownership check - prevents race condition
      const result =
        entityType === "character"
          ? await prisma.character.updateMany({
              where: { id, userId: user!.id },
              data: updateData,
            })
          : await prisma.product.updateMany({
              where: { id, userId: user!.id },
              data: updateData,
            });

      if (result.count === 0) {
        return NextResponse.json(
          { error: `${capitalizeFirst(entityType)} not found` },
          { status: 404 }
        );
      }

      // Fetch the updated entity to return (with ownership check)
      const entity =
        entityType === "character"
          ? await prisma.character.findFirst({ where: { id, userId: user!.id } })
          : await prisma.product.findFirst({ where: { id, userId: user!.id } });

      return NextResponse.json(entity);
    } catch (error) {
      logger.error(`Failed to update ${entityType}`, {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return NextResponse.json(
        { error: `Failed to update ${entityType}` },
        { status: 500 }
      );
    }
  };
}
