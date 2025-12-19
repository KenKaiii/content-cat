import { NextResponse } from "next/server";
import { validateSession } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({
      user: session.user,
      session: {
        expiresAt: session.session.expiresAt,
      },
    });
  } catch (error) {
    logger.error("Auth check error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
