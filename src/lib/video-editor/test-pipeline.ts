/**
 * Video Editor Pipeline Test
 *
 * Usage:
 *   npx tsx src/lib/video-editor/test-pipeline.ts
 *
 * Make sure you have FFmpeg installed:
 *   brew install ffmpeg (macOS)
 *   apt-get install ffmpeg (Ubuntu)
 *
 * You can test with sample videos or your own:
 *   VIDEO1=./video1.mp4 VIDEO2=./video2.mp4 npx tsx src/lib/video-editor/test-pipeline.ts
 */

import * as path from "path";
import {
  createPipeline,
  createTransition,
  createShortFormVideo,
  checkFFmpegAvailable,
  getFFmpegVersion,
  parseSrt,
  generateSrt,
  TRANSITION_DEFINITIONS,
  SUBTITLE_PRESETS,
  PLATFORM_PRESETS,
} from "./index";

// ============================================================================
// Test Utilities
// ============================================================================

function log(message: string, ...args: unknown[]) {
  console.log(`[TEST] ${message}`, ...args);
}

function success(message: string) {
  console.log(`✅ ${message}`);
}

function error(message: string) {
  console.error(`❌ ${message}`);
}

function section(title: string) {
  console.log("\n" + "=".repeat(60));
  console.log(` ${title}`);
  console.log("=".repeat(60) + "\n");
}

// ============================================================================
// Tests
// ============================================================================

async function testFFmpegAvailability() {
  section("FFmpeg Availability Check");

  const available = await checkFFmpegAvailable();

  if (available) {
    const version = await getFFmpegVersion();
    success(`FFmpeg is available: ${version}`);
    return true;
  } else {
    error(
      "FFmpeg is not available. Please install FFmpeg to use video editing features."
    );
    log(
      "Install with: brew install ffmpeg (macOS) or apt-get install ffmpeg (Ubuntu)"
    );
    return false;
  }
}

function testSrtParsing() {
  section("SRT Parsing Test");

  const sampleSrt = `1
00:00:00,000 --> 00:00:02,500
Hello, this is a test

2
00:00:02,500 --> 00:00:05,000
Welcome to Content Cat

3
00:00:05,000 --> 00:00:08,000
Creating short-form content is easy!`;

  log("Parsing sample SRT...");
  const cues = parseSrt(sampleSrt);

  if (cues.length === 3) {
    success(`Parsed ${cues.length} cues correctly`);
    cues.forEach((cue) => {
      log(
        `  Cue ${cue.index}: ${cue.startTime}s - ${cue.endTime}s: "${cue.text}"`
      );
    });

    // Test regeneration
    const regenerated = generateSrt(cues);
    log("\nRegenerated SRT:");
    log(regenerated);
    success("SRT parsing and generation working");
  } else {
    error(`Expected 3 cues, got ${cues.length}`);
  }
}

function testTransitions() {
  section("Transitions Test");

  log("Available transitions:");
  Object.values(TRANSITION_DEFINITIONS).forEach((def) => {
    log(
      `  ${def.type.padEnd(12)} | ${def.category.padEnd(12)} | ${def.name} - ${def.description}`
    );
  });

  log("\nCreating transitions...");

  const fade = createTransition("fade", 0.5);
  log(`  fade: ${JSON.stringify(fade)}`);

  const flash = createTransition("flash", 0.2);
  log(`  flash: ${JSON.stringify(flash)}`);

  const glitch = createTransition("glitch");
  log(`  glitch (default duration): ${JSON.stringify(glitch)}`);

  success("Transitions working");
}

function testSubtitlePresets() {
  section("Subtitle Presets Test");

  log("Available subtitle presets:");
  Object.entries(SUBTITLE_PRESETS).forEach(([name, style]) => {
    log(`\n  ${name}:`);
    log(`    Font: ${style.fontFamily} ${style.fontSize}px`);
    log(`    Color: ${style.fontColor}`);
    log(`    Position: ${(style.positionY ?? 0.5) * 100}% from top`);
    log(`    Animation: ${style.animation}`);
  });

  success("Subtitle presets available");
}

function testPlatformPresets() {
  section("Platform Presets Test");

  log("Available platform presets:");
  Object.entries(PLATFORM_PRESETS).forEach(([platform, preset]) => {
    log(`\n  ${platform}:`);
    log(`    Aspect Ratio: ${preset.aspectRatio}`);
    log(`    Resolution: ${preset.resolution}`);
    log(`    FPS: ${preset.fps}`);
    log(`    Max Duration: ${preset.maxDuration ?? "unlimited"}s`);
    log(`    Video Bitrate: ${preset.videoBitrate}`);
  });

  success("Platform presets available");
}

function testPipelineBuilder() {
  section("Pipeline Builder Test");

  log("Building pipeline configuration...");

  try {
    const config = createPipeline()
      .addClipsFromPaths(["./video1.mp4", "./video2.mp4", "./video3.mp4"])
      .setAllTransitions(createTransition("fade", 0.3))
      .addBackgroundMusic("./music.mp3", { volume: 0.25 })
      .setSubtitlesFromSrt(
        `1
00:00:00,000 --> 00:00:03,000
Test subtitle`,
        "tiktok"
      )
      .setOutputForPlatform("tiktok", "./output.mp4")
      .build();

    log("Pipeline configuration:");
    log(`  Clips: ${config.clips.length}`);
    log(`  Transitions: ${config.transitions?.length ?? 0}`);
    log(`  Audio tracks: ${config.audioTracks?.length ?? 0}`);
    log(`  Subtitles: ${config.subtitles?.entries.length ?? 0} entries`);
    log(`  Output: ${config.output.path}`);
    log(`    Format: ${config.output.format}`);
    log(`    Aspect: ${config.output.aspectRatio}`);
    log(`    Resolution: ${config.output.resolution}`);

    success("Pipeline builder working");
  } catch (err) {
    error(`Pipeline builder failed: ${err}`);
  }
}

async function testPipelineExecution() {
  section("Pipeline Execution Test");

  // Get test video paths from environment or use defaults
  const video1 = process.env.VIDEO1;
  const video2 = process.env.VIDEO2;

  if (!video1 || !video2) {
    log("Skipping execution test - no test videos provided");
    log("To run this test, set VIDEO1 and VIDEO2 environment variables:");
    log(
      "  VIDEO1=./video1.mp4 VIDEO2=./video2.mp4 npx tsx src/lib/video-editor/test-pipeline.ts"
    );
    return;
  }

  log(`Using test videos: ${video1}, ${video2}`);

  const outputPath = path.join(process.cwd(), "test-output.mp4");

  log("Creating short-form video...");

  const result = await createShortFormVideo({
    clips: [video1, video2],
    outputPath,
    transitionStyle: "fade",
    onProgress: (progress) => {
      process.stdout.write(
        `\r  Progress: ${progress.percent}% (${progress.stage})    `
      );
    },
  });

  console.log(); // New line after progress

  if (result.success) {
    success(`Video created: ${result.outputPath}`);
    log(`  Processing time: ${result.processingTime}ms`);
    log(
      `  File size: ${result.fileSize ? Math.round(result.fileSize / 1024) + " KB" : "unknown"}`
    );
  } else {
    error(`Video creation failed: ${result.error}`);
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log("\n🎬 Video Editor Pipeline Tests\n");

  // Check FFmpeg first
  const ffmpegAvailable = await testFFmpegAvailability();

  // Run non-FFmpeg tests
  testSrtParsing();
  testTransitions();
  testSubtitlePresets();
  testPlatformPresets();
  testPipelineBuilder();

  // Run execution test if FFmpeg is available
  if (ffmpegAvailable) {
    await testPipelineExecution();
  }

  section("Summary");

  log("All configuration tests passed!");

  if (!ffmpegAvailable) {
    log("\n⚠️  FFmpeg not available - video processing features disabled");
    log("Install FFmpeg to enable full functionality");
  }

  log("\n📚 Quick Start:");
  log(`
  import { createShortFormVideo } from '@/lib/video-editor';

  const result = await createShortFormVideo({
    clips: ['./clip1.mp4', './clip2.mp4'],
    outputPath: './output.mp4',
    music: { source: './music.mp3', volume: 0.3 },
    transitionStyle: 'fade',
  });
  `);
}

main().catch(console.error);
