/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Batch Generate BTS (Behind-the-Scenes) Prompt Thumbnails
 * Uses the Breaking Bad selfie as reference (not mirror selfie)
 *
 * Usage: node scripts/generate-bts-batch.js
 */

const fs = require("fs");
const path = require("path");

const API_KEY = "4c6bec602d48c03944dc57c88d39dee3";
const BASE_URL = "https://api.kie.ai";
const OUTPUT_DIR = path.join(__dirname, "../public/images/prompts");

// Use corporate-editorial as reference (direct camera, selfie-like, no mirror)
const REFERENCE_URL =
  "https://raw.githubusercontent.com/KenKaiii/content-cat/main/public/images/prompts/corporate-editorial.jpg";

// All BTS prompts - emphasizing direct selfie, not mirror selfie
const btsPrompts = [
  {
    id: "bts-mad-max",
    title: "BTS: Mad Max",
    description: "Behind-the-scenes selfie on post-apocalyptic movie set",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a post-apocalyptic desert movie set. Person taking a direct selfie with the camera, subtle confident expression. Post-apocalyptic wasteland environment with vast desert, sand, dust storms, custom war vehicles, spiked cars, muscle cars, chains, metal scraps, rugged props, burnt textures visible in background. Harsh sunlight mixed with cinematic contrast lighting, dust in the air, professional film crew and cameras visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing rugged desert-worn clothing. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with warm orange, dusty brown and teal tones. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-game-of-thrones",
    title: "BTS: Game of Thrones",
    description: "Behind-the-scenes selfie on medieval fantasy set",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a medieval fantasy TV series set. Person taking a direct selfie with the camera, subtle confident expression. Epic castle environment with stone walls, throne room, torches, medieval banners, swords, armor props, dragon egg replicas visible in background. Dramatic diffused lighting mixed with practical torch light, fog machines creating atmosphere, professional film crew visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing medieval-inspired costume with leather and fur details. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with cold blue, grey stone and warm firelight tones. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-stranger-things",
    title: "BTS: Stranger Things",
    description: "Behind-the-scenes selfie on 80s supernatural horror set",
    prompt: `Cinematic behind-the-scenes selfie photo taken on an 80s supernatural horror TV series set. Person taking a direct selfie with the camera, subtle confident expression. Retro 1980s environment with arcade machines, vintage bikes, Christmas lights, Upside Down portal props with vines and fog, retro wood-paneled walls visible in background. Moody lighting with red and blue gels, fog machines, professional film crew visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing vintage 80s clothing with denim jacket. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with warm nostalgic amber, cool blue and eerie red tones. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-breaking-bad",
    title: "BTS: Breaking Bad",
    description: "Behind-the-scenes selfie on desert crime drama set",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a desert crime drama TV series set. Person taking a direct selfie with the camera, subtle confident expression. New Mexico desert environment with RV camper van, chemical lab equipment props, barrels, industrial warehouse setting, dusty terrain visible in background. Harsh desert sunlight with dramatic shadows, professional film crew visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing yellow hazmat suit or casual desert-appropriate clothing. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with warm yellow desert tones, harsh contrast and desaturated earth colors. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-star-wars",
    title: "BTS: Star Wars",
    description: "Behind-the-scenes selfie on space opera movie set",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a space opera movie set. Person taking a direct selfie with the camera, subtle confident expression. Spaceship interior environment with metal corridors, control panels with blinking lights, hologram projector props, droid robots, lightsaber props visible in background. Dramatic practical lighting with blue and orange gels, fog for atmosphere, professional film crew and green screens visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing futuristic space pilot costume. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with cool steel blue, warm amber and deep space black tones. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-walking-dead",
    title: "BTS: Walking Dead",
    description: "Behind-the-scenes selfie on zombie apocalypse set",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a zombie apocalypse TV series set. Person taking a direct selfie with the camera, subtle confident expression. Post-apocalyptic environment with abandoned buildings, overturned cars, chain-link fences, zombie extras in makeup, fake blood props, weapons visible in background. Gritty natural lighting with overcast sky, professional film crew and makeup artists visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing rugged survivor clothing with leather vest. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with desaturated greens, muted earth tones. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-squid-game",
    title: "BTS: Squid Game",
    description: "Behind-the-scenes selfie on Korean survival game set",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a Korean survival game TV series set. Person taking a direct selfie with the camera, subtle confident expression. Colorful game arena environment with geometric shapes, giant doll prop, pastel pink and mint green staircases, masked guards in pink jumpsuits visible in background. Dramatic studio lighting with stark contrasts, professional film crew visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing green numbered tracksuit contestant costume. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with vibrant pink, mint green tones. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-wednesday",
    title: "BTS: Wednesday",
    description: "Behind-the-scenes selfie on gothic academy set",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a gothic academy TV series set. Person taking a direct selfie with the camera, subtle confident expression. Dark academia environment with gothic stone architecture, stained glass windows, candelabras, vintage furniture, mysterious portraits, cobwebs visible in background. Moody dramatic lighting with cool blue and purple tones, professional film crew visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing dark preppy school uniform with blazer. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with desaturated cool tones, deep shadows. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-peaky-blinders",
    title: "BTS: Peaky Blinders",
    description: "Behind-the-scenes selfie on 1920s gangster set",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a 1920s British gangster TV series set. Person taking a direct selfie with the camera, subtle confident expression. Industrial Birmingham environment with cobblestone streets, brick factories, vintage cars, pub interior, gas lamps, fog for smoky atmosphere visible in background. Dramatic moody lighting with golden tungsten and cold shadows, professional film crew visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing 1920s three-piece tweed suit with peaked cap. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with desaturated sepia, warm amber highlights. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-blade-runner",
    title: "BTS: Blade Runner",
    description: "Behind-the-scenes selfie on cyberpunk noir set",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a cyberpunk noir movie set. Person taking a direct selfie with the camera, subtle confident expression. Dystopian futuristic city environment with neon signs, rain effects, holographic billboard screens, wet streets reflecting lights, steam vents visible in background. Dramatic noir lighting with neon pink and cyan gels, rain machines, professional film crew visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing futuristic noir trench coat with high collar. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with neon pink, electric blue tones. Keep the subject's exact facial features from the reference photo.`,
  },
  {
    id: "bts-money-heist",
    title: "BTS: Money Heist",
    description: "Behind-the-scenes selfie on Spanish heist drama set",
    prompt: `Cinematic behind-the-scenes selfie photo taken on a Spanish heist drama TV series set. Person taking a direct selfie with the camera, subtle confident expression. Bank vault environment with gold bars props, money printing machines, Salvador Dali masks on tables, red jumpsuit costumes visible in background. Dramatic studio lighting with warm Spanish golden tones, professional film crew visible behind. Realistic candid selfie angle from arm's length, looking directly at camera. Wearing iconic red jumpsuit heist costume. Ultra photorealistic, documentary style, 35mm lens look, shallow depth of field, cinematic color grading with rich red, warm gold tones. Keep the subject's exact facial features from the reference photo.`,
  },
];

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

async function generatePrompt(promptConfig, index, total) {
  const { id, prompt } = promptConfig;
  const filename = `${id}.jpg`;

  console.log(`\n[${index + 1}/${total}] Generating: ${id}`);
  console.log(`  Prompt: ${prompt.substring(0, 60)}...`);

  try {
    const taskId = await createTask(prompt, "1:1", REFERENCE_URL);
    console.log(`  Task: ${taskId}`);

    const imageUrl = await waitForTask(taskId);
    console.log(""); // newline after dots

    if (!imageUrl) {
      throw new Error("No image URL returned");
    }

    await downloadImage(imageUrl, filename);
    console.log(`  Saved: ${filename}`);

    return { success: true, id, filename };
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return { success: false, id, error: error.message };
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("BTS Batch Generator - Using Breaking Bad Reference");
  console.log("=".repeat(60));
  console.log(`\nReference: ${REFERENCE_URL}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Total prompts: ${btsPrompts.length}`);

  const results = [];

  for (let i = 0; i < btsPrompts.length; i++) {
    const result = await generatePrompt(btsPrompts[i], i, btsPrompts.length);
    results.push(result);

    // Delay between requests
    if (i < btsPrompts.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("GENERATION COMPLETE");
  console.log("=".repeat(60));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`\nSuccessful: ${successful.length}/${results.length}`);

  if (failed.length > 0) {
    console.log(`\nFailed:`);
    failed.forEach((f) => console.log(`  - ${f.id}: ${f.error}`));
  }
}

main().catch(console.error);
