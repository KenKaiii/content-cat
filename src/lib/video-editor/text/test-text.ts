#!/usr/bin/env npx tsx
/**
 * Text Rendering Test
 * Test text overlays with FFmpeg drawtext filter
 */

import { spawn } from "child_process";
import * as path from "path";
import { existsSync, mkdirSync } from "fs";
import {
  createStaticText,
  createTimedText,
  createTextLayer,
  generateDrawtextFilter,
  generateTextLayerFilters,
  getPreset,
  getPresetNames,
  escapeTextForFFmpeg,
  colorToFFmpeg,
  positionToFFmpeg,
  isFontAvailable,
  getAvailableFonts,
  getMissingFonts,
  TITLE_PRESETS,
  HOOK_PRESETS,
  SUBTITLE_PRESETS,
} from "./index";
import type { VideoDimensions } from "./index";

// ============================================================================
// Test Configuration
// ============================================================================

const TEST_OUTPUT_DIR = path.join(process.cwd(), "test-output");
const PUBLIC_IMAGES = path.join(process.cwd(), "public", "images");

// Video dimensions for 9:16 vertical (TikTok/Reels)
const DIMS: VideoDimensions = { width: 1080, height: 1920 };

// ============================================================================
// Helpers
// ============================================================================

function log(message: string) {
  console.log(`[test] ${message}`);
}

function success(message: string) {
  console.log(`✅ ${message}`);
}

function fail(message: string) {
  console.log(`❌ ${message}`);
}

function section(title: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(60)}\n`);
}

async function runFFmpeg(
  args: string[]
): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    const ffmpeg = spawn("ffmpeg", args);
    let output = "";
    let errorOutput = "";

    ffmpeg.stdout.on("data", (data) => {
      output += data.toString();
    });

    ffmpeg.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    ffmpeg.on("close", (code) => {
      resolve({
        success: code === 0,
        output: code === 0 ? output : errorOutput,
      });
    });
  });
}

// ============================================================================
// Unit Tests
// ============================================================================

function testColorConversion() {
  section("Color Conversion Tests");

  const tests = [
    { input: "#FFFFFF", expected: "0xFFFFFF" },
    { input: "#000000", expected: "0x000000" },
    { input: "#FF0000", expected: "0xFF0000" },
    { input: "rgb(255, 0, 0)", expected: "0xff0000" },
    { input: "rgba(255, 0, 0, 0.5)", expected: "0xff000080" },
    { input: "rgba(0, 0, 0, 0.8)", expected: "0x000000cc" },
  ];

  let passed = 0;
  for (const test of tests) {
    const result = colorToFFmpeg(test.input);
    if (result.toLowerCase() === test.expected.toLowerCase()) {
      success(`${test.input} → ${result}`);
      passed++;
    } else {
      fail(`${test.input} → ${result} (expected ${test.expected})`);
    }
  }

  log(`\nPassed: ${passed}/${tests.length}`);
  return passed === tests.length;
}

function testTextEscaping() {
  section("Text Escaping Tests");

  const tests = [
    { input: "Hello World", contains: "Hello World" },
    { input: "It's great!", contains: "'\\''" }, // Single quote escaping
    { input: "50% off!", contains: "%%" }, // Percent escaping
    { input: "Price: $10", contains: "\\:" }, // Colon escaping
    { input: "Hello\\nWorld", contains: "\\\\" }, // Backslash escaping
  ];

  let passed = 0;
  for (const test of tests) {
    const result = escapeTextForFFmpeg(test.input);
    if (result.includes(test.contains)) {
      success(`"${test.input}" correctly escaped`);
      passed++;
    } else {
      fail(`"${test.input}" → "${result}" (should contain "${test.contains}")`);
    }
  }

  log(`\nPassed: ${passed}/${tests.length}`);
  return passed === tests.length;
}

function testPositionConversion() {
  section("Position Conversion Tests");

  const presets = [
    "top-left",
    "top-center",
    "top-right",
    "middle-left",
    "middle-center",
    "middle-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ] as const;

  let passed = 0;
  for (const preset of presets) {
    const pos = positionToFFmpeg(preset, DIMS);
    if (pos.x && pos.y) {
      success(`${preset} → x=${pos.x}, y=${pos.y}`);
      passed++;
    } else {
      fail(`${preset} failed to convert`);
    }
  }

  log(`\nPassed: ${passed}/${presets.length}`);
  return passed === presets.length;
}

function testPresets() {
  section("Preset Tests");

  const presetNames = getPresetNames();
  log(`Found ${presetNames.length} presets\n`);

  let passed = 0;
  for (const name of presetNames) {
    const preset = getPreset(name);
    if (preset && preset.style && preset.style.font) {
      success(`${name}: ${preset.name} (${preset.category})`);
      passed++;
    } else {
      fail(`${name}: Invalid preset structure`);
    }
  }

  log(`\nPassed: ${passed}/${presetNames.length}`);
  return passed === presetNames.length;
}

function testDrawtextFilter() {
  section("Drawtext Filter Generation Tests");

  const tests = [
    {
      name: "Simple text",
      element: createStaticText(
        "Hello World",
        "middle-center",
        TITLE_PRESETS["title-impact"].style
      ),
    },
    {
      name: "Timed text",
      element: createTimedText(
        "Timed Caption",
        0,
        5,
        "bottom-center",
        SUBTITLE_PRESETS["subtitle-tiktok"].style
      ),
    },
    {
      name: "With stroke and shadow",
      element: createStaticText(
        "Styled Text",
        "top-center",
        HOOK_PRESETS["hook-youtube"].style
      ),
    },
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      const filter = generateDrawtextFilter(test.element, DIMS);
      if (filter.startsWith("drawtext=") && filter.includes("text=")) {
        success(`${test.name}: Generated valid filter`);
        log(`  Filter: ${filter.substring(0, 100)}...`);
        passed++;
      } else {
        fail(`${test.name}: Invalid filter format`);
      }
    } catch (error) {
      fail(`${test.name}: ${error}`);
    }
  }

  log(`\nPassed: ${passed}/${tests.length}`);
  return passed === tests.length;
}

function testFontAvailability() {
  section("Font Availability Tests");

  const fonts = getAvailableFonts();
  const available = fonts.filter((f) => isFontAvailable(f.family));
  const missing = getMissingFonts();

  log(`Total fonts defined: ${fonts.length}`);
  log(`Available on system: ${available.length}`);
  log(`Missing (downloadable): ${missing.length}\n`);

  // Check common system fonts
  const systemFonts = ["Arial", "Impact", "Helvetica", "Verdana"];
  let found = 0;

  for (const font of systemFonts) {
    if (isFontAvailable(font)) {
      success(`${font} is available`);
      found++;
    } else {
      log(`  ${font} not found (may vary by system)`);
    }
  }

  log(`\nSystem fonts found: ${found}/${systemFonts.length}`);

  if (missing.length > 0) {
    log("\nMissing fonts (run download-fonts.ts to install):");
    for (const font of missing.slice(0, 5)) {
      log(`  - ${font.family}`);
    }
    if (missing.length > 5) {
      log(`  ... and ${missing.length - 5} more`);
    }
  }

  return true; // Don't fail for font availability
}

// ============================================================================
// Integration Tests (with FFmpeg)
// ============================================================================

async function testFFmpegTextOverlay() {
  section("FFmpeg Text Overlay Test");

  // Find an image to use as background
  const images = ["after-1.png", "after-2.png", "after-3.png"];
  let sourceImage: string | null = null;

  for (const img of images) {
    const imgPath = path.join(PUBLIC_IMAGES, img);
    if (existsSync(imgPath)) {
      sourceImage = imgPath;
      break;
    }
  }

  if (!sourceImage) {
    log("No test images found, skipping FFmpeg integration test");
    return true;
  }

  log(`Using source image: ${sourceImage}`);

  // Ensure output directory exists
  if (!existsSync(TEST_OUTPUT_DIR)) {
    mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
  }

  const outputPath = path.join(TEST_OUTPUT_DIR, "text-overlay-test.mp4");

  // Create text elements
  const titleElement = createStaticText(
    "AMAZING TITLE",
    "top-center",
    TITLE_PRESETS["title-impact"].style
  );

  const hookElement = createStaticText(
    "Watch this!",
    "middle-center",
    HOOK_PRESETS["hook-tiktok"].style
  );

  const subtitleElement = createStaticText(
    "Subscribe for more",
    "bottom-center",
    SUBTITLE_PRESETS["subtitle-classic"].style
  );

  // Create text layer
  const layer = createTextLayer("main", [
    titleElement,
    hookElement,
    subtitleElement,
  ]);

  // Generate filter
  const { filterComplex, outputLabel } = generateTextLayerFilters(
    layer,
    DIMS,
    "scaled"
  );

  log(`Generated filter complex:\n${filterComplex}\n`);

  // Build FFmpeg command
  // First scale image, then apply text
  const args = [
    "-y",
    "-loop",
    "1",
    "-i",
    sourceImage,
    "-t",
    "5",
    "-filter_complex",
    `[0:v]scale=${DIMS.width}:${DIMS.height}:force_original_aspect_ratio=decrease,pad=${DIMS.width}:${DIMS.height}:(ow-iw)/2:(oh-ih)/2[scaled];${filterComplex}`,
    "-map",
    `[${outputLabel}]`,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-r",
    "30",
    outputPath,
  ];

  log("Running FFmpeg...");
  const result = await runFFmpeg(args);

  if (result.success && existsSync(outputPath)) {
    success(`Created text overlay video: ${outputPath}`);
    return true;
  } else {
    fail("FFmpeg text overlay failed");
    log(result.output.slice(-500));
    return false;
  }
}

async function testMultiplePresets() {
  section("Multiple Preset Rendering Test");

  const images = ["after-1.png", "after-2.png", "after-3.png"];
  let sourceImage: string | null = null;

  for (const img of images) {
    const imgPath = path.join(PUBLIC_IMAGES, img);
    if (existsSync(imgPath)) {
      sourceImage = imgPath;
      break;
    }
  }

  if (!sourceImage) {
    log("No test images found, skipping preset test");
    return true;
  }

  // Ensure output directory exists
  if (!existsSync(TEST_OUTPUT_DIR)) {
    mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
  }

  // Test a few different presets
  const presetsToTest = [
    { name: "title-neon", text: "NEON GLOW" },
    { name: "title-comic", text: "POW!" },
    { name: "subtitle-mrbeast", text: "$100,000" },
    { name: "hook-urgent", text: "BREAKING NEWS" },
  ];

  let passed = 0;

  for (const { name, text } of presetsToTest) {
    const preset = getPreset(name);
    if (!preset) {
      fail(`Preset ${name} not found`);
      continue;
    }

    const element = createStaticText(
      text,
      preset.defaultPosition ?? "middle-center",
      preset.style
    );
    const filter = generateDrawtextFilter(element, DIMS);

    const outputPath = path.join(TEST_OUTPUT_DIR, `preset-${name}.mp4`);

    const args = [
      "-y",
      "-loop",
      "1",
      "-i",
      sourceImage,
      "-t",
      "3",
      "-vf",
      `scale=${DIMS.width}:${DIMS.height}:force_original_aspect_ratio=decrease,pad=${DIMS.width}:${DIMS.height}:(ow-iw)/2:(oh-ih)/2,${filter}`,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-r",
      "30",
      outputPath,
    ];

    const result = await runFFmpeg(args);

    if (result.success && existsSync(outputPath)) {
      success(`${name}: ${outputPath}`);
      passed++;
    } else {
      fail(`${name}: Failed to render`);
      log(result.output.slice(-200));
    }
  }

  log(`\nPassed: ${passed}/${presetsToTest.length}`);
  return passed === presetsToTest.length;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log("\n🔤 Text Rendering Module Tests\n");

  const results: { name: string; passed: boolean }[] = [];

  // Unit tests
  results.push({ name: "Color Conversion", passed: testColorConversion() });
  results.push({ name: "Text Escaping", passed: testTextEscaping() });
  results.push({
    name: "Position Conversion",
    passed: testPositionConversion(),
  });
  results.push({ name: "Presets", passed: testPresets() });
  results.push({ name: "Drawtext Filter", passed: testDrawtextFilter() });
  results.push({ name: "Font Availability", passed: testFontAvailability() });

  // Integration tests
  results.push({
    name: "FFmpeg Text Overlay",
    passed: await testFFmpegTextOverlay(),
  });
  results.push({
    name: "Multiple Presets",
    passed: await testMultiplePresets(),
  });

  // Summary
  section("Test Summary");

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  for (const result of results) {
    if (result.passed) {
      success(result.name);
    } else {
      fail(result.name);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Total: ${passed}/${total} tests passed`);
  console.log(`${"=".repeat(60)}\n`);

  if (passed < total) {
    console.log("Some tests failed. Check output above for details.");
    process.exit(1);
  }

  console.log("All tests passed! Text rendering module is working correctly.");
  console.log(`\nTest videos saved to: ${TEST_OUTPUT_DIR}`);
}

main().catch(console.error);
