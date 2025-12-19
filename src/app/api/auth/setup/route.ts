import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUser } from "@/lib/auth";
import {
  validatePassword,
  getPasswordRequirements,
} from "@/lib/password-validation";
import { logger } from "@/lib/logger";

/**
 * Setup route to create the initial admin user
 * This can only be used when no users exist in the database
 * Uses a transaction with serializable isolation to prevent race conditions
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate password with complexity requirements
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: passwordValidation.errors[0],
          requirements: getPasswordRequirements(),
          strength: passwordValidation.strength,
        },
        { status: 400 }
      );
    }

    // Use transaction to atomically check and create user
    // This prevents race condition where two requests could both create admin users
    const result = await prisma.$transaction(async (tx) => {
      // Check if any users already exist within the transaction
      const userCount = await tx.user.count();
      if (userCount > 0) {
        return { error: "Setup already completed. Users already exist." };
      }

      // Create admin user within the same transaction
      const user = await createUser(
        email.toLowerCase().trim(),
        password,
        name,
        "admin"
      );

      return { user };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
    });
  } catch (error) {
    logger.error("Setup error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 }
    );
  }
}

/**
 * Check if setup is needed
 */
export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({
      setupRequired: userCount === 0,
    });
  } catch (error) {
    logger.error("Setup check error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to check setup status" },
      { status: 500 }
    );
  }
}
