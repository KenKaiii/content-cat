/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Regenerate Featured Cards Images
 */

const fs = require("fs");
const path = require("path");

const API_KEY = "4c6bec602d48c03944dc57c88d39dee3";
const BASE_URL = "https://api.kie.ai";
const OUTPUT_DIR = path.join(__dirname);

const imagesToGenerate = [
  {
    filename: "video-ads.jpg",
    aspectRatio: "16:9",
    prompt:
      "Sleek product on minimalist background, premium skincare bottle with soft studio lighting, clean commercial photography, single product hero shot, photorealistic",
  },
  {
    filename: "horror-shorts.jpg",
    aspectRatio: "16:9",
    prompt:
      "Terrified woman looking at camera in dark room, scared expression, horror movie still, dim moody lighting, single person, cinematic horror scene, photorealistic",
  },
  {
    filename: "educational.jpg",
    aspectRatio: "16:9",
    prompt:
      "Friendly teacher explaining to camera, casual professional attire, clean bright background, educational video still, one person talking, natural expression, photorealistic",
  },
  {
    filename: "funny-shorts.jpg",
    aspectRatio: "16:9",
    prompt:
      "Person with hilarious shocked reaction face, wide eyes and open mouth, bright lighting, comedy video still, single person, expressive funny moment, photorealistic",
  },
  {
    filename: "viral-shorts.jpg",
    aspectRatio: "16:9",
    prompt:
      "Young person mid-dance move, dynamic pose, trendy streetwear, clean background, TikTok dance video still, energetic, single person, photorealistic",
  },
  {
    filename: "personal-branding.jpg",
    aspectRatio: "16:9",
    prompt:
      "Confident professional speaking to camera, business casual attire, clean modern office background, personal brand content creator, single person, warm natural lighting, photorealistic",
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
      input: { prompt, aspect_ratio: aspectRatio, quality: "high" },
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
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), Buffer.from(buffer));
  console.log(`  Saved: ${filename}`);
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

async function generate(config, retries = 3) {
  for (let r = 0; r < retries; r++) {
    try {
      console.log(`\n${config.filename}`);
      const taskId = await createTask(config.prompt, config.aspectRatio);
      const url = await waitForTask(taskId);
      console.log("");
      await downloadImage(url, config.filename);
      return true;
    } catch (e) {
      console.error(`  Error: ${e.message}`);
      if (r < retries - 1) console.log("  Retrying...");
    }
  }
  return false;
}

async function main() {
  console.log("Generating Featured Cards Images");
  for (const img of imagesToGenerate) {
    await generate(img);
  }
  console.log("\nDone!");
}

main();
