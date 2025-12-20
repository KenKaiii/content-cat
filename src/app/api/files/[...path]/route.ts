import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync, lstatSync } from "fs";
import path from "path";
import { logger } from "@/lib/logger";

// Base upload directory
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// MIME type mapping
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

// Note: No auth required - files use random UUIDs for security (obscurity)
// This allows Next.js Image optimization to work properly
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const relativePath = pathSegments.join("/");
    const filePath = path.join(UPLOAD_DIR, relativePath);

    // Security: Ensure the resolved path is within UPLOAD_DIR
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(UPLOAD_DIR)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Security: Check for symlink attacks
    try {
      const stat = lstatSync(resolvedPath);
      if (stat.isSymbolicLink()) {
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });
      }
    } catch {
      // File doesn't exist, will be caught below
    }

    // Check if file exists
    if (!existsSync(resolvedPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await readFile(resolvedPath);

    // Determine content type
    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: unknown) {
    logger.error("File serve error:", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}
