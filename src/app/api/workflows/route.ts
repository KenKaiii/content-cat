import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { logger } from "@/lib/logger";

// GET - List all workflows for the current user
export async function GET(request: Request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const workflows = await prisma.workflow.findMany({
      where: { userId: user!.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(workflows);
  } catch (err) {
    logger.error("Failed to fetch workflows", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}

// POST - Create a new workflow
export async function POST(request: Request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { name, nodes, edges } = body;

    const workflow = await prisma.workflow.create({
      data: {
        userId: user!.id,
        name: name || "Untitled Workflow",
        nodes: nodes || [],
        edges: edges || [],
      },
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (err) {
    logger.error("Failed to create workflow", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to create workflow" },
      { status: 500 }
    );
  }
}
