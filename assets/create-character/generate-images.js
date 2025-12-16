/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Image Generation Script for Create Character Page
 * Uses Kie.ai Seedream 4.5 API to generate character images
 *
 * Usage: node generate-images.js
 */

const fs = require("fs");
const path = require("path");

const API_KEY = "4c6bec602d48c03944dc57c88d39dee3";
const BASE_URL = "https://api.kie.ai";
const OUTPUT_DIR = path.join(__dirname);

// All images to generate
const imagesToGenerate = [
  // Preview images (4) - above title, portrait cards with rotations
  // Aspect ratio 3:4 (portrait)
  {
    filename: "character-1.jpg",
    aspectRatio: "3:4",
    prompt:
      "Professional headshot portrait of a young woman in her 20s, looking directly at camera, neutral expression, soft studio lighting, clean background, high-end fashion photography, photorealistic, sharp focus on face, natural skin texture",
  },
  {
    filename: "character-2.jpg",
    aspectRatio: "3:4",
    prompt:
      "Professional headshot portrait of a man in his 30s, looking directly at camera, slight confident smile, soft studio lighting, clean gray background, corporate headshot style, photorealistic, sharp focus on face, natural skin texture",
  },
  {
    filename: "character-3.jpg",
    aspectRatio: "3:4",
    prompt:
      "Professional headshot portrait of an Asian woman in her 20s, looking directly at camera, warm friendly expression, soft natural lighting, clean background, lifestyle photography style, photorealistic, sharp focus on face",
  },
  {
    filename: "character-4.jpg",
    aspectRatio: "3:4",
    prompt:
      "Professional headshot portrait of a young man in his 20s, looking directly at camera, relaxed neutral expression, soft studio lighting, clean white background, modern headshot style, photorealistic, sharp focus on face",
  },

  // Gallery images (5) - below button, taller portrait cards
  // Aspect ratio 2:3 (taller portrait for h-72 w-48)
  {
    filename: "gallery-1.jpg",
    aspectRatio: "2:3",
    prompt:
      "Full upper body portrait of a stylish woman in casual clothes, looking at camera, candid relaxed pose, soft natural daylight, minimal clean background, lifestyle photography, photorealistic, fashion editorial style",
  },
  {
    filename: "gallery-2.jpg",
    aspectRatio: "2:3",
    prompt:
      "Full upper body portrait of a man in smart casual attire, looking at camera, confident stance, soft studio lighting, clean minimal background, modern portrait photography, photorealistic",
  },
  {
    filename: "gallery-3.jpg",
    aspectRatio: "2:3",
    prompt:
      "Full upper body portrait of a young woman with natural makeup, looking at camera, slight smile, soft golden hour lighting, clean simple background, candid lifestyle photography, photorealistic",
  },
  {
    filename: "gallery-4.jpg",
    aspectRatio: "2:3",
    prompt:
      "Full upper body portrait of an Asian man in casual shirt, looking directly at camera, friendly expression, soft natural lighting, clean white background, modern portrait style, photorealistic",
  },
  {
    filename: "gallery-5.jpg",
    aspectRatio: "2:3",
    prompt:
      "Full upper body portrait of a woman with curly hair, looking at camera, warm genuine smile, soft studio lighting, clean minimal background, lifestyle portrait photography, photorealistic",
  },

  // Good reference photos (5) - clear face shots for the modal
  // Aspect ratio 4:5 (slightly portrait, matches aspect-[0.8])
  {
    filename: "good-1.jpg",
    aspectRatio: "3:4",
    prompt:
      "Clear headshot of a woman looking directly at camera, front facing view, neutral expression, even studio lighting on face, plain background, passport photo style but high quality, photorealistic, perfect for AI training reference",
  },
  {
    filename: "good-2.jpg",
    aspectRatio: "3:4",
    prompt:
      "Clear headshot of the same woman from slight angle, three-quarter view, neutral expression, even lighting, plain background, high quality reference photo, photorealistic, clear facial features visible",
  },
  {
    filename: "good-3.jpg",
    aspectRatio: "3:4",
    prompt:
      "Clear headshot of a woman looking directly at camera, slight natural smile, well-lit face, clean simple background, professional quality reference photo, photorealistic, sharp focus on facial features",
  },
  {
    filename: "good-4.jpg",
    aspectRatio: "3:4",
    prompt:
      "Clear headshot of a woman from side profile view, neutral expression, good lighting showing facial structure, plain background, high quality reference photo for AI, photorealistic",
  },
  {
    filename: "good-5.jpg",
    aspectRatio: "3:4",
    prompt:
      "Clear headshot of a woman looking at camera, different angle view, relaxed expression, soft even lighting, minimal background, ideal reference photo quality, photorealistic, clear skin details",
  },

  // Bad reference photos (5) - examples of what NOT to use
  // Same aspect ratio but with problematic elements
  {
    filename: "bad-1.jpg",
    aspectRatio: "3:4",
    prompt:
      "Person wearing large dark sunglasses covering eyes, face partially obscured, outdoor setting, casual photo, cannot see eyes clearly, poor reference photo example, photorealistic",
  },
  {
    filename: "bad-2.jpg",
    aspectRatio: "3:4",
    prompt:
      "Crowded group photo at a party, multiple people in frame, hard to identify individual faces, busy background with other guests, poor quality reference photo example, photorealistic",
  },
  {
    filename: "bad-3.jpg",
    aspectRatio: "3:4",
    prompt:
      "Person wearing face mask and hat, face mostly covered, only eyes visible, outdoor setting, identity obscured, poor reference photo example, photorealistic",
  },
  {
    filename: "bad-4.jpg",
    aspectRatio: "3:4",
    prompt:
      "Blurry photo of person in motion, face out of focus, motion blur visible, poor lighting, low quality image, bad reference photo example, photorealistic blur effect",
  },
  {
    filename: "bad-5.jpg",
    aspectRatio: "3:4",
    prompt:
      "Person with heavy Instagram filter applied, unrealistic skin smoothing, oversaturated colors, face details lost to filter effects, poor reference photo example, heavily filtered look",
  },
];

async function createTask(prompt, aspectRatio) {
  const response = await fetch(`${BASE_URL}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "seedream/4.5-text-to-image",
      input: {
        prompt: prompt,
        aspect_ratio: aspectRatio,
        quality: "high",
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create task: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data?.taskId || data.taskId;
}

async function getTaskResult(taskId) {
  const response = await fetch(
    `${BASE_URL}/api/v1/jobs/recordInfo?taskId=${taskId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get task: ${response.status} - ${error}`);
  }

  const json = await response.json();
  return json.data || json;
}

async function downloadImage(url, filename) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, Buffer.from(buffer));
  console.log(`  Saved: ${filePath}`);
}

async function waitForTask(taskId, maxAttempts = 60, intervalMs = 5000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await getTaskResult(taskId);

    if (result.state === "success") {
      if (result.resultJson) {
        const parsed = JSON.parse(result.resultJson);
        result.imageUrls = parsed.resultUrls || [];
      }
      return result;
    } else if (result.state === "failed" || result.state === "error") {
      throw new Error(`Task failed: ${result.failMsg || "Unknown error"}`);
    }

    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Task timed out");
}

async function generateImage(imageConfig) {
  const { filename, prompt, aspectRatio } = imageConfig;

  console.log(`\nGenerating: ${filename}`);
  console.log(`  Prompt: ${prompt.substring(0, 80)}...`);
  console.log(`  Aspect Ratio: ${aspectRatio}`);

  try {
    const taskId = await createTask(prompt, aspectRatio);
    console.log(`  Task ID: ${taskId}`);

    console.log(`  Waiting for completion...`);
    const result = await waitForTask(taskId);

    const imageUrl = result.imageUrls?.[0];
    if (!imageUrl) {
      console.log("  Result:", JSON.stringify(result, null, 2));
      throw new Error("No image URL in result");
    }
    console.log("");

    await downloadImage(imageUrl, filename);
    console.log(`  Complete!`);

    return { success: true, filename };
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return { success: false, filename, error: error.message };
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("Create Character Page Image Generator");
  console.log("Using Kie.ai Seedream 4.5 API");
  console.log("=".repeat(60));
  console.log(`\nOutput directory: ${OUTPUT_DIR}`);
  console.log(`Total images to generate: ${imagesToGenerate.length}`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = [];

  for (let i = 0; i < imagesToGenerate.length; i++) {
    console.log(`\n[${i + 1}/${imagesToGenerate.length}]`);
    const result = await generateImage(imagesToGenerate[i]);
    results.push(result);

    if (i < imagesToGenerate.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("GENERATION COMPLETE");
  console.log("=".repeat(60));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`\nSuccessful: ${successful.length}/${results.length}`);

  if (failed.length > 0) {
    console.log(`\nFailed images:`);
    failed.forEach((f) => console.log(`  - ${f.filename}: ${f.error}`));
  }

  const logPath = path.join(OUTPUT_DIR, "generation-log.json");
  fs.writeFileSync(
    logPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        results,
      },
      null,
      2
    )
  );
  console.log(`\nLog saved to: ${logPath}`);
}

main().catch(console.error);
