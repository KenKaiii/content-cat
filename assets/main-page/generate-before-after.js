/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Generate Before/After Image Pairs for TopChoice
 * Step 1: Generate "before" images
 * Step 2: Use before image as reference to generate "after" images
 */

const fs = require("fs");
const path = require("path");

const API_KEY = "4c6bec602d48c03944dc57c88d39dee3";
const BASE_URL = "https://api.kie.ai";
const OUTPUT_DIR = path.join(__dirname);

// Before/After pairs to generate
const pairs = [
  {
    name: "sharpen",
    beforePrompt:
      "Slightly blurry photo of a woman with long hair, soft focus, casual indoor lighting, candid phone photo quality, photorealistic",
    afterPrompt:
      "Crystal clear sharp photo of a woman with long hair, perfect focus, every detail crisp, professional quality, photorealistic",
  },
  {
    name: "upscale",
    beforePrompt:
      "Low resolution grainy photo of a man in a coffee shop, visible pixelation, compressed quality, casual snapshot, photorealistic",
    afterPrompt:
      "High resolution detailed photo of a man in a coffee shop, sharp details, premium quality, professional photography, photorealistic",
  },
  {
    name: "bg-remix",
    beforePrompt:
      "Woman standing against plain white wall, neutral background, simple indoor setting, casual portrait, photorealistic",
    afterPrompt:
      "Woman standing in beautiful sunset beach scene, golden hour lighting, stunning tropical background, professional portrait, photorealistic",
  },
  {
    name: "color",
    beforePrompt:
      "Flat washed out photo of city street scene, dull colors, overcast lighting, no contrast, casual snapshot, photorealistic",
    afterPrompt:
      "Cinematic color graded city street scene, teal and orange tones, rich contrast, movie still quality, dramatic lighting, photorealistic",
  },
  {
    name: "portrait",
    beforePrompt:
      "Casual selfie of a young man, phone camera quality, basic lighting, everyday look, slightly unflattering angle, photorealistic",
    afterPrompt:
      "Professional headshot of a young man, studio lighting, perfect composition, magazine quality portrait, polished look, photorealistic",
  },
  {
    name: "lighting",
    beforePrompt:
      "Underexposed dark photo of woman indoors, poor lighting, hard shadows on face, barely visible details, photorealistic",
    afterPrompt:
      "Well lit photo of woman indoors, soft balanced lighting, no harsh shadows, clear bright exposure, professional quality, photorealistic",
  },
  {
    name: "product",
    beforePrompt:
      "Casual phone photo of a perfume bottle on messy desk, poor lighting, cluttered background, amateur product shot, photorealistic",
    afterPrompt:
      "Luxury perfume bottle on elegant marble surface, soft studio lighting, premium product photography, advertisement quality, minimalist, photorealistic",
  },
  {
    name: "style",
    beforePrompt:
      "Normal photo of a woman in garden, standard photography, natural colors, casual outdoor portrait, photorealistic",
    afterPrompt:
      "Oil painting style portrait of a woman in garden, impressionist brushstrokes, artistic interpretation, fine art aesthetic, painterly quality",
  },
];

async function createTask(prompt, aspectRatio, imageUrl = null) {
  const input = {
    prompt,
    aspect_ratio: aspectRatio,
    quality: "high",
  };

  // Add image reference if provided
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
  const data = await response.json();
  return data.data?.taskId || data.taskId;
}

async function getTaskResult(taskId) {
  const response = await fetch(
    `${BASE_URL}/api/v1/jobs/recordInfo?taskId=${taskId}`,
    {
      headers: { Authorization: `Bearer ${API_KEY}` },
    }
  );
  const json = await response.json();
  return json.data || json;
}

async function downloadImage(url, filename) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, Buffer.from(buffer));
  return filePath;
}

async function waitForTask(taskId) {
  for (let i = 0; i < 120; i++) {
    const result = await getTaskResult(taskId);
    if (result.state === "success") {
      const parsed = JSON.parse(result.resultJson);
      return parsed.resultUrls?.[0];
    } else if (result.state === "fail") {
      throw new Error(result.failMsg);
    }
    process.stdout.write(".");
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error("Timeout");
}

async function generate(prompt, filename, imageRef = null, retries = 3) {
  for (let r = 0; r < retries; r++) {
    try {
      console.log(`  Generating: ${filename}`);
      const taskId = await createTask(prompt, "1:1", imageRef);
      const url = await waitForTask(taskId);
      console.log("");
      await downloadImage(url, filename);
      console.log(`  Saved: ${filename}`);
      return url; // Return URL for use as reference
    } catch (e) {
      console.error(`  Error: ${e.message}`);
      if (r < retries - 1) {
        console.log("  Retrying...");
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }
  return null;
}

async function main() {
  console.log("=".repeat(50));
  console.log("Generating Before/After Pairs");
  console.log("=".repeat(50));

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    console.log(`\n[${i + 1}/${pairs.length}] ${pair.name.toUpperCase()}`);

    // Generate BEFORE image
    console.log("\n  --- BEFORE ---");
    const beforeUrl = await generate(
      pair.beforePrompt,
      `${pair.name}-before.jpg`
    );

    if (beforeUrl) {
      // Generate AFTER image using before as reference
      console.log("\n  --- AFTER (using before as reference) ---");
      await generate(pair.afterPrompt, `${pair.name}-after.jpg`, beforeUrl);
    }

    // Small delay between pairs
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n" + "=".repeat(50));
  console.log("COMPLETE");
  console.log("=".repeat(50));
}

main().catch(console.error);
