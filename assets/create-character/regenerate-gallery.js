/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Regenerate Gallery Images with Consistent Style
 * Same background, pose, lighting - different people
 */

const fs = require("fs");
const path = require("path");

const API_KEY = "4c6bec602d48c03944dc57c88d39dee3";
const BASE_URL = "https://api.kie.ai";
const OUTPUT_DIR = path.join(__dirname);

// Base prompt template for consistency
const baseStyle =
  "professional portrait photography, upper body shot, looking directly at camera, neutral expression, soft gray gradient background, studio lighting, clean minimal aesthetic, fashion editorial style, photorealistic, high quality";

const imagesToGenerate = [
  {
    filename: "gallery-1.jpg",
    aspectRatio: "2:3",
    prompt: `Young Asian woman with long dark hair, wearing stylish purple jacket and silver accessories, ${baseStyle}`,
  },
  {
    filename: "gallery-2.jpg",
    aspectRatio: "2:3",
    prompt: `Woman with wavy black hair, wearing simple black top, red lipstick, ${baseStyle}`,
  },
  {
    filename: "gallery-3.jpg",
    aspectRatio: "2:3",
    prompt: `Black man with shaved head, wearing black tank top, athletic build, ${baseStyle}`,
  },
  {
    filename: "gallery-4.jpg",
    aspectRatio: "2:3",
    prompt: `European woman with short brown hair, wearing beige beret and blue cardigan over white shirt, ${baseStyle}`,
  },
  {
    filename: "gallery-5.jpg",
    aspectRatio: "2:3",
    prompt: `Young man with curly hair, wearing white t-shirt, relaxed confident look, ${baseStyle}`,
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

async function waitForTask(taskId, maxAttempts = 120, intervalMs = 5000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await getTaskResult(taskId);

    if (result.state === "success") {
      if (result.resultJson) {
        const parsed = JSON.parse(result.resultJson);
        result.imageUrls = parsed.resultUrls || [];
      }
      return result;
    } else if (
      result.state === "fail" ||
      result.state === "failed" ||
      result.state === "error"
    ) {
      // Return failure info so we can retry
      throw new Error(`Task failed: ${result.failMsg || "Unknown error"}`);
    }

    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Task timed out");
}

async function generateImage(imageConfig, maxRetries = 3) {
  const { filename, prompt, aspectRatio } = imageConfig;

  for (let retry = 0; retry < maxRetries; retry++) {
    if (retry > 0) {
      console.log(`  Retry ${retry}/${maxRetries - 1}...`);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait before retry
    }

    console.log(`\nGenerating: ${filename}`);
    console.log(`  Prompt: ${prompt.substring(0, 80)}...`);

    try {
      const taskId = await createTask(prompt, aspectRatio);
      console.log(`  Task ID: ${taskId}`);
      console.log(`  Waiting...`);

      const result = await waitForTask(taskId);
      const imageUrl = result.imageUrls?.[0];

      if (!imageUrl) throw new Error("No image URL");

      console.log("");
      await downloadImage(imageUrl, filename);
      console.log(`  Done!`);
      return { success: true, filename };
    } catch (error) {
      console.error(`  Error: ${error.message}`);
      if (retry === maxRetries - 1) {
        return { success: false, filename, error: error.message };
      }
    }
  }
  return { success: false, filename, error: "Max retries exceeded" };
}

async function main() {
  console.log("Regenerating Gallery Images - Consistent Style");
  console.log("=".repeat(50));

  for (let i = 0; i < imagesToGenerate.length; i++) {
    console.log(`\n[${i + 1}/${imagesToGenerate.length}]`);
    await generateImage(imagesToGenerate[i]);
    if (i < imagesToGenerate.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("COMPLETE");
}

main().catch(console.error);
