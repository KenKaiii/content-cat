import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { logger } from "@/lib/logger";
import { saveFiles } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const category = (formData.get("category") as string) || "general";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Save files to local storage
    const uploadedUrls = await saveFiles(files, category);

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    logger.error("Upload error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
