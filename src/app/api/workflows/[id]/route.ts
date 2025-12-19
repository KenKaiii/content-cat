import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { logger } from "@/lib/logger";

// GET - Get a single workflow by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { id } = await params;
    const workflow = await prisma.workflow.findFirst({
      where: { id, userId: user!.id },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(workflow);
  } catch (err) {
    logger.error("Failed to fetch workflow", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to fetch workflow" },
      { status: 500 }
    );
  }
}

// PATCH - Update a workflow
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, nodes, edges } = body;

    const updateData: {
      name?: string;
      nodes?: object;
      edges?: object;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (nodes !== undefined) updateData.nodes = nodes;
    if (edges !== undefined) updateData.edges = edges;

    // Atomic update with ownership check
    const result = await prisma.workflow.updateMany({
      where: { id, userId: user!.id },
      data: updateData,
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    // Fetch the updated workflow to return
    const workflow = await prisma.workflow.findUnique({ where: { id } });

    return NextResponse.json(workflow);
  } catch (err) {
    logger.error("Failed to update workflow", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to update workflow" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a workflow
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { id } = await params;

    const result = await prisma.workflow.deleteMany({
      where: { id, userId: user!.id },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("Failed to delete workflow", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to delete workflow" },
      { status: 500 }
    );
  }
}
