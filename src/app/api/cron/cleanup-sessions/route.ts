import { NextResponse } from "next/server";
import { cleanupExpiredSessions } from "@/lib/auth";
import { logger } from "@/lib/logger";

/**
 * Cleanup expired sessions endpoint
 * This can be called by a cron job service (Vercel Cron, AWS Lambda, etc.)
 *
 * For Vercel, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-sessions",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
  // Verify the request is from a trusted source
  // In production, use a secret token or IP whitelist
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is set, verify it matches
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deletedCount = await cleanupExpiredSessions();

    logger.info("Session cleanup completed", { deletedCount });

    return NextResponse.json({
      success: true,
      deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Session cleanup failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "Failed to cleanup sessions" },
      { status: 500 }
    );
  }
}
