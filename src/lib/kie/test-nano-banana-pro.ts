/**
 * Test script for Nano Banana Pro API
 * Run with: npx tsx src/lib/kie/test-nano-banana-pro.ts
 */

import {
  createNanoBananaProClient,
  ASPECT_RATIOS,
  RESOLUTIONS,
  OUTPUT_FORMATS,
  type TaskState,
} from "./nano-banana-pro";

const API_KEY = process.env.KIE_API_KEY || "";

async function runTests() {
  console.log("=== Testing Nano Banana Pro API ===\n");

  if (!API_KEY) {
    console.error("Error: KIE_API_KEY environment variable is required");
    console.log(
      "Usage: KIE_API_KEY=your_key npx tsx src/lib/kie/test-nano-banana-pro.ts"
    );
    process.exit(1);
  }

  const client = createNanoBananaProClient(API_KEY);

  console.log("Available options:");
  console.log("  Aspect Ratios:", ASPECT_RATIOS.join(", "));
  console.log("  Resolutions:", RESOLUTIONS.join(", "));
  console.log("  Output Formats:", OUTPUT_FORMATS.join(", "));
  console.log();

  // Test 1: Basic text-to-image
  console.log("--- Test 1: Basic text-to-image ---");
  let test1Url: string | undefined;
  try {
    const result = await client.generateImage(
      {
        prompt:
          "A cute orange cat sitting on a cozy armchair, digital art style",
        aspect_ratio: "1:1",
        resolution: "1K",
        output_format: "png",
      },
      {
        pollInterval: 3000,
        maxAttempts: 60,
        onStateUpdate: (state: TaskState) => {
          process.stdout.write(`\r  State: ${state}   `);
        },
      }
    );

    console.log("\n  SUCCESS!");
    console.log("  Task ID:", result.task.data?.taskId);
    console.log("  Result URLs:", result.output?.resultUrls);
    test1Url = result.output?.resultUrls?.[0];
  } catch (error) {
    console.error("\n  FAILED:", error);
  }

  // Test 2: Different aspect ratio (16:9)
  console.log("\n--- Test 2: 16:9 aspect ratio, 2K resolution ---");
  try {
    const result = await client.generateImage(
      {
        prompt: "A beautiful mountain landscape at sunset, cinematic",
        aspect_ratio: "16:9",
        resolution: "2K",
        output_format: "jpg",
      },
      {
        pollInterval: 3000,
        maxAttempts: 60,
        onStateUpdate: (state: TaskState) => {
          process.stdout.write(`\r  State: ${state}   `);
        },
      }
    );

    console.log("\n  SUCCESS!");
    console.log("  Task ID:", result.task.data?.taskId);
    console.log("  Result URLs:", result.output?.resultUrls);
  } catch (error) {
    console.error("\n  FAILED:", error);
  }

  // Test 3: With reference image (image-to-image)
  console.log("\n--- Test 3: With reference image ---");
  try {
    // Using the cat image from test 1 as reference (if available)
    const referenceImage =
      test1Url ||
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1200px-Cat03.jpg";
    const result = await client.generateImage(
      {
        prompt:
          "Transform into a watercolor painting style, soft pastel colors",
        image_input: [referenceImage],
        aspect_ratio: "1:1",
        resolution: "1K",
        output_format: "png",
      },
      {
        pollInterval: 3000,
        maxAttempts: 60,
        onStateUpdate: (state: TaskState) => {
          process.stdout.write(`\r  State: ${state}   `);
        },
      }
    );

    console.log("\n  SUCCESS!");
    console.log("  Task ID:", result.task.data?.taskId);
    console.log("  Result URLs:", result.output?.resultUrls);
  } catch (error) {
    console.error("\n  FAILED:", error);
  }

  console.log("\n=== All tests completed ===");
}

runTests();
