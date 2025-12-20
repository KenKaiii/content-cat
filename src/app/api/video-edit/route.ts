import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { writeFile, mkdir, unlink, stat } from "fs/promises";
import { existsSync } from "fs";
import { spawn } from "child_process";
import path from "path";
import { requireAuth } from "@/lib/auth-helpers";
import { logger } from "@/lib/logger";
import { checkFFmpegAvailable } from "@/lib/video-editor/pipeline";
import type { AspectRatio, TransitionType } from "@/lib/video-editor/types";
import { getDimensions } from "@/lib/video-editor/config";

// Base directories
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const TEMP_DIR = path.join(process.cwd(), "tmp");

// Map transition types to FFmpeg xfade names
const XFADE_MAP: Record<string, string> = {
  none: "fade",
  fade: "fade",
  crossfade: "dissolve",
  slideLeft: "slideleft",
  slideRight: "slideright",
  slideUp: "slideup",
  slideDown: "slidedown",
  zoomIn: "smoothup",
  zoomOut: "smoothdown",
  wipeLeft: "wipeleft",
  wipeRight: "wiperight",
  blur: "fadeblack",
  glitch: "diagtl",
  flash: "fadewhite",
};

// Ensure directories exist
async function ensureDirs(): Promise<void> {
  for (const dir of [UPLOAD_DIR, TEMP_DIR]) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }
  const videoEditDir = path.join(UPLOAD_DIR, "video-edit");
  if (!existsSync(videoEditDir)) {
    await mkdir(videoEditDir, { recursive: true });
  }
}

/**
 * Download a video from a URL to a local temp file
 */
async function downloadToTemp(url: string, index: number): Promise<string> {
  await ensureDirs();

  // If it's already a local file path, convert to absolute
  if (url.startsWith("/api/files/")) {
    const relativePath = url.replace("/api/files/", "");
    const localPath = path.join(UPLOAD_DIR, relativePath);
    if (existsSync(localPath)) {
      return localPath;
    }
    throw new Error(`Local file not found: ${url}`);
  }

  // Download remote URL to temp file
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const ext = url.includes(".webm") ? ".webm" : ".mp4";
  const tempPath = path.join(TEMP_DIR, `temp-${index}-${randomUUID()}${ext}`);

  await writeFile(tempPath, Buffer.from(buffer));
  return tempPath;
}

/**
 * Clean up temporary files
 */
async function cleanupTempFiles(files: string[]): Promise<void> {
  for (const file of files) {
    if (file.startsWith(TEMP_DIR)) {
      try {
        await unlink(file);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Get video duration using ffprobe
 */
async function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve) => {
    const ffprobe = spawn("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);

    let output = "";
    ffprobe.stdout.on("data", (data) => {
      output += data.toString();
    });

    ffprobe.on("close", (code) => {
      if (code === 0) {
        const duration = parseFloat(output.trim());
        resolve(isNaN(duration) ? 5 : duration);
      } else {
        resolve(5); // Default 5 seconds if probe fails
      }
    });

    ffprobe.on("error", () => {
      resolve(5);
    });
  });
}

/**
 * Execute FFmpeg command and return result
 */
async function runFFmpeg(
  args: string[]
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const ffmpeg = spawn("ffmpeg", args);

    let stderr = "";

    ffmpeg.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    ffmpeg.on("close", (code) => {
      const processingTime = Date.now() - startTime;
      logger.debug("FFmpeg completed", { code, processingTime });

      if (code === 0) {
        resolve({ success: true });
      } else {
        resolve({
          success: false,
          error: `FFmpeg exited with code ${code}: ${stderr.slice(-500)}`,
        });
      }
    });

    ffmpeg.on("error", (err) => {
      resolve({
        success: false,
        error: `Failed to start FFmpeg: ${err.message}`,
      });
    });
  });
}

/**
 * Simple video concatenation without transitions (handles videos without audio)
 */
async function simpleConcatVideos(
  inputPaths: string[],
  outputPath: string,
  aspectRatio: AspectRatio = "16:9"
): Promise<{ success: boolean; error?: string }> {
  const dims = getDimensions(aspectRatio, "1080p");

  // Create a concat list file
  const listPath = path.join(TEMP_DIR, `concat-${randomUUID()}.txt`);
  const listContent = inputPaths.map((p) => `file '${p}'`).join("\n");
  await writeFile(listPath, listContent);

  try {
    // First, normalize all videos to same format (video only)
    const normalizedPaths: string[] = [];
    for (let i = 0; i < inputPaths.length; i++) {
      const normalizedPath = path.join(
        TEMP_DIR,
        `normalized-${i}-${randomUUID()}.mp4`
      );
      normalizedPaths.push(normalizedPath);

      const result = await runFFmpeg([
        "-i",
        inputPaths[i],
        "-vf",
        `scale=${dims.width}:${dims.height}:force_original_aspect_ratio=decrease,pad=${dims.width}:${dims.height}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30`,
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "23",
        "-an", // No audio
        "-y",
        normalizedPath,
      ]);

      if (!result.success) {
        // Cleanup normalized files
        for (const p of normalizedPaths) {
          try {
            await unlink(p);
          } catch {
            /* ignore */
          }
        }
        return result;
      }
    }

    // Create new concat list with normalized videos
    const normalizedListPath = path.join(
      TEMP_DIR,
      `concat-normalized-${randomUUID()}.txt`
    );
    const normalizedListContent = normalizedPaths
      .map((p) => `file '${p}'`)
      .join("\n");
    await writeFile(normalizedListPath, normalizedListContent);

    // Concatenate normalized videos
    const result = await runFFmpeg([
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      normalizedListPath,
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "23",
      "-movflags",
      "+faststart",
      "-y",
      outputPath,
    ]);

    // Cleanup
    await unlink(listPath);
    await unlink(normalizedListPath);
    for (const p of normalizedPaths) {
      try {
        await unlink(p);
      } catch {
        /* ignore */
      }
    }

    return result;
  } catch (error) {
    try {
      await unlink(listPath);
    } catch {
      /* ignore */
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Concat failed",
    };
  }
}

/**
 * Concatenate videos with xfade transitions (video only, no audio)
 * Supports different transitions between each pair of videos
 */
async function concatWithTransitions(
  inputPaths: string[],
  outputPath: string,
  transitions: TransitionConfig[] = [],
  aspectRatio: AspectRatio = "16:9"
): Promise<{ success: boolean; error?: string }> {
  if (inputPaths.length === 1) {
    // Just copy the single video
    return simpleConcatVideos(inputPaths, outputPath, aspectRatio);
  }

  const dims = getDimensions(aspectRatio, "1080p");
  const defaultTransition: TransitionConfig = {
    type: "slideUp",
    duration: 0.2,
  };

  // Get durations of all videos
  const durations: number[] = [];
  for (const p of inputPaths) {
    const duration = await getVideoDuration(p);
    durations.push(duration);
  }

  // Build input arguments
  const inputArgs: string[] = [];
  inputPaths.forEach((p) => {
    inputArgs.push("-i", p);
  });

  // Build filter complex for video transitions only
  const filterParts: string[] = [];

  // Scale and format each input
  inputPaths.forEach((_, i) => {
    filterParts.push(
      `[${i}:v]scale=${dims.width}:${dims.height}:force_original_aspect_ratio=decrease,` +
        `pad=${dims.width}:${dims.height}:(ow-iw)/2:(oh-ih)/2:black,` +
        `setsar=1,fps=30,format=yuv420p[v${i}]`
    );
  });

  // Chain xfade transitions with different transitions for each pair
  let currentLabel = "v0";
  let runningOffset = durations[0];

  for (let i = 0; i < inputPaths.length - 1; i++) {
    const nextLabel = `v${i + 1}`;
    const isLast = i === inputPaths.length - 2;
    const outLabel = isLast ? "outv" : `xv${i}`;

    // Get transition for this pair (or default)
    const transition = transitions[i] || defaultTransition;
    const xfadeName = XFADE_MAP[transition.type] || "dissolve";
    const transitionDuration = transition.duration || 0.2;

    // Calculate offset (where transition starts)
    const offset = Math.max(0, runningOffset - transitionDuration);

    filterParts.push(
      `[${currentLabel}][${nextLabel}]xfade=transition=${xfadeName}:duration=${transitionDuration}:offset=${offset}[${outLabel}]`
    );

    currentLabel = outLabel;
    runningOffset = offset + durations[i + 1];
  }

  const filterComplex = filterParts.join(";\n");

  const result = await runFFmpeg([
    ...inputArgs,
    "-filter_complex",
    filterComplex,
    "-map",
    "[outv]",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "23",
    "-movflags",
    "+faststart",
    "-y",
    outputPath,
  ]);

  return result;
}

/**
 * Trim a video to specified time range
 */
async function trimVideo(
  inputPath: string,
  outputPath: string,
  startTime: number,
  endTime?: number,
  aspectRatio: AspectRatio = "16:9"
): Promise<{ success: boolean; error?: string }> {
  const dims = getDimensions(aspectRatio, "1080p");

  const args = ["-i", inputPath, "-ss", startTime.toString()];

  if (endTime !== undefined) {
    args.push("-to", endTime.toString());
  }

  args.push(
    "-vf",
    `scale=${dims.width}:${dims.height}:force_original_aspect_ratio=decrease,pad=${dims.width}:${dims.height}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30`,
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "23",
    "-an", // No audio for now
    "-movflags",
    "+faststart",
    "-y",
    outputPath
  );

  return runFFmpeg(args);
}

interface TransitionConfig {
  type: TransitionType;
  duration: number;
}

interface ConcatRequest {
  operation: "concat";
  videoUrls: string[];
  transitions?: TransitionConfig[];
  aspectRatio?: AspectRatio;
}

interface TrimRequest {
  operation: "trim";
  videoUrl: string;
  startTime: number;
  endTime?: number;
  aspectRatio?: AspectRatio;
}

interface TransitionRequest {
  operation: "transition";
  videoUrls: string[];
  transitionType: TransitionType;
  transitionDuration: number;
  aspectRatio?: AspectRatio;
}

type VideoEditRequest = ConcatRequest | TrimRequest | TransitionRequest;

export async function POST(request: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  const startTime = Date.now();

  try {
    // Check FFmpeg availability
    const ffmpegAvailable = await checkFFmpegAvailable();
    if (!ffmpegAvailable) {
      return NextResponse.json(
        { error: "FFmpeg is not installed or not in PATH" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as VideoEditRequest;
    const { operation } = body;

    await ensureDirs();

    // Generate output path
    const outputId = randomUUID();
    const outputPath = path.join(UPLOAD_DIR, "video-edit", `${outputId}.mp4`);
    const outputUrl = `/api/files/video-edit/${outputId}.mp4`;

    const tempFiles: string[] = [];

    try {
      let result: { success: boolean; error?: string };

      switch (operation) {
        case "concat": {
          const { videoUrls, transitions, aspectRatio } = body;

          if (!videoUrls || videoUrls.length === 0) {
            return NextResponse.json(
              { error: "At least one video URL is required" },
              { status: 400 }
            );
          }

          logger.info("Starting video concat", {
            count: videoUrls.length,
            transitionCount: transitions?.length || 0,
          });

          // Download all videos to temp files
          const localPaths: string[] = [];
          for (let i = 0; i < videoUrls.length; i++) {
            const localPath = await downloadToTemp(videoUrls[i], i);
            localPaths.push(localPath);
            if (localPath.startsWith(TEMP_DIR)) {
              tempFiles.push(localPath);
            }
          }

          // Check if any transition is not "none" - use transitions if so
          const hasTransitions =
            transitions &&
            transitions.length > 0 &&
            transitions.some((t: TransitionConfig) => t.type !== "none");

          if (hasTransitions) {
            result = await concatWithTransitions(
              localPaths,
              outputPath,
              transitions || [],
              aspectRatio || "16:9"
            );
          } else {
            result = await simpleConcatVideos(
              localPaths,
              outputPath,
              aspectRatio || "16:9"
            );
          }
          break;
        }

        case "trim": {
          const {
            videoUrl,
            startTime: trimStart,
            endTime: trimEnd,
            aspectRatio,
          } = body;

          if (!videoUrl) {
            return NextResponse.json(
              { error: "Video URL is required" },
              { status: 400 }
            );
          }

          logger.info("Starting video trim", {
            startTime: trimStart,
            endTime: trimEnd,
          });

          // Download video to temp file
          const localPath = await downloadToTemp(videoUrl, 0);
          if (localPath.startsWith(TEMP_DIR)) {
            tempFiles.push(localPath);
          }

          result = await trimVideo(
            localPath,
            outputPath,
            trimStart,
            trimEnd,
            aspectRatio || "16:9"
          );
          break;
        }

        case "transition": {
          const { videoUrls, transitionType, transitionDuration, aspectRatio } =
            body;

          if (!videoUrls || videoUrls.length < 2) {
            return NextResponse.json(
              { error: "At least 2 video URLs are required for transitions" },
              { status: 400 }
            );
          }

          logger.info("Starting video transition", {
            count: videoUrls.length,
            transitionType,
          });

          // Download all videos to temp files
          const localPaths: string[] = [];
          for (let i = 0; i < videoUrls.length; i++) {
            const localPath = await downloadToTemp(videoUrls[i], i);
            localPaths.push(localPath);
            if (localPath.startsWith(TEMP_DIR)) {
              tempFiles.push(localPath);
            }
          }

          // Create a transitions array with the same transition for all pairs
          const uniformTransitions: TransitionConfig[] = Array.from(
            { length: localPaths.length - 1 },
            () => ({ type: transitionType, duration: transitionDuration })
          );

          result = await concatWithTransitions(
            localPaths,
            outputPath,
            uniformTransitions,
            aspectRatio || "16:9"
          );
          break;
        }

        default:
          return NextResponse.json(
            { error: `Unknown operation: ${operation}` },
            { status: 400 }
          );
      }

      // Check result
      if (!result.success) {
        logger.error("Video edit failed", { error: result.error });
        return NextResponse.json(
          { error: result.error || "Video processing failed" },
          { status: 500 }
        );
      }

      // Get output file size
      let fileSize: number | undefined;
      try {
        const stats = await stat(outputPath);
        fileSize = stats.size;
      } catch {
        // Ignore stat errors
      }

      const processingTime = Date.now() - startTime;

      logger.info("Video edit completed", {
        operation,
        outputPath: outputUrl,
        processingTime,
        fileSize,
      });

      return NextResponse.json({
        success: true,
        videoUrl: outputUrl,
        processingTime,
        fileSize,
      });
    } finally {
      // Clean up temp files
      await cleanupTempFiles(tempFiles);
    }
  } catch (error) {
    logger.error("Video edit error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Video processing failed",
      },
      { status: 500 }
    );
  }
}
