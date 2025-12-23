/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Generate a Single Prompt Thumbnail
 * Uses existing mirror-selfie image as reference
 *
 * Usage: node scripts/generate-single-prompt.js
 */

const fs = require("fs");
const path = require("path");

const API_KEY = "4c6bec602d48c03944dc57c88d39dee3";
const BASE_URL = "https://api.kie.ai";
const OUTPUT_DIR = path.join(__dirname, "../public/images/prompts");

// Reference image - corporate-editorial (direct camera, selfie-like, no mirror)
const REFERENCE_URL =
  "https://raw.githubusercontent.com/KenKaiii/content-cat/main/public/images/prompts/corporate-editorial.jpg";

// The prompt to generate
const promptConfig = {
  id: "bts-wednesday",
  title: "BTS: Wednesday",
  description: "Behind-the-scenes selfie on gothic academy set",
  category: "filters",
  prompt: `Cinematic behind-the-scenes selfie photo taken on a gothic academy TV series set. Person taking a direct selfie, arm extended toward camera, face looking directly into lens with subtle confident expression. Dark academia environment with gothic stone architecture, stained glass windows, candelabras, vintage furniture, mysterious portraits, cobwebs visible in background. Moody dramatic lighting with cool blue and purple tones, professional film crew visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing dark preppy school uniform with blazer and tie. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with desaturated cool tones, deep shadows. Keep the subject's exact facial features from the reference photo.`,
};

async function createTask(prompt, aspectRatio, imageUrl = null) {
  const input = {
    prompt,
    aspect_ratio: aspectRatio,
    quality: "high",
  };

  if (imageUrl) {
    input.image_urls = [imageUrl];
  }

  const response = await fetch(`${BASE_URL}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "seedream/4.5-text-to-image",
      input,
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
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

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
  return filePath;
}

async function waitForTask(taskId, maxAttempts = 120, intervalMs = 5000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await getTaskResult(taskId);

    if (result.state === "success") {
      if (result.resultJson) {
        const parsed = JSON.parse(result.resultJson);
        return parsed.resultUrls?.[0];
      }
      return null;
    } else if (result.state === "failed" || result.state === "fail") {
      throw new Error(`Task failed: ${result.failMsg || "Unknown error"}`);
    }

    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Task timed out");
}

async function main() {
  console.log("=".repeat(60));
  console.log("Single Prompt Generator");
  console.log("Using Kie.ai Seedream 4.5 API");
  console.log("=".repeat(60));

  const { id, prompt } = promptConfig;
  const filename = `${id}.jpg`;

  console.log(`\nGenerating: ${id}`);
  console.log(`Reference: ${REFERENCE_URL}`);
  console.log(`Prompt: ${prompt.substring(0, 80)}...`);
  console.log(`\nWaiting for generation`);

  try {
    const taskId = await createTask(prompt, "1:1", REFERENCE_URL);
    console.log(`Task created: ${taskId}`);

    const imageUrl = await waitForTask(taskId);
    console.log(""); // newline after progress dots

    if (!imageUrl) {
      throw new Error("No image URL returned");
    }

    await downloadImage(imageUrl, filename);
    console.log(`\nSaved: ${OUTPUT_DIR}/${filename}`);

    console.log("\n" + "=".repeat(60));
    console.log("SUCCESS!");
    console.log("=".repeat(60));
    console.log(`\nAdd to prompts.ts:`);
    console.log(`{
  id: "${promptConfig.id}",
  title: "${promptConfig.title}",
  description: "${promptConfig.description}",
  image: "/images/prompts/${filename}",
  category: "${promptConfig.category}",
  prompt: \`${promptConfig.prompt}\`,
},`);
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }
}

main();
