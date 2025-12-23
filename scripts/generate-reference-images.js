/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Generate Reference Images for Upload Modal and Entity Pages
 * Creates good/bad example photos for characters and products
 *
 * Usage: node scripts/generate-reference-images.js [type]
 *   type: "character", "product", "pages", or "all" (default: all)
 */

const fs = require("fs");
const path = require("path");

const API_KEY = "4c6bec602d48c03944dc57c88d39dee3";
const BASE_URL = "https://api.kie.ai";
const OUTPUT_DIR = path.join(__dirname, "../public/images/references");

// ============================================================================
// CHARACTER GOOD REFERENCES - Same person, different angles
// ============================================================================
const characterGoodPhotos = [
  {
    id: "char-good-1",
    prompt: `Professional headshot portrait of a young woman with shoulder-length brown hair, looking directly at camera with neutral friendly expression, clean studio lighting, plain light gray background, sharp focus on face, natural skin texture, front-facing angle, high quality photography. Age 25-30, natural makeup, wearing simple black top.`,
  },
  {
    id: "char-good-2",
    prompt: `Professional portrait of a young woman with shoulder-length brown hair, 3/4 angle view turning slightly to the right, neutral friendly expression, clean studio lighting, plain light gray background, sharp focus on face, natural skin texture, high quality photography. Age 25-30, natural makeup, wearing simple black top. Same person as reference.`,
  },
  {
    id: "char-good-3",
    prompt: `Professional side profile portrait of a young woman with shoulder-length brown hair, looking to the left, neutral expression, clean studio lighting with rim light on hair, plain light gray background, sharp focus on face, natural skin texture, high quality photography. Age 25-30, natural makeup, wearing simple black top. Same person as reference.`,
  },
  {
    id: "char-good-4",
    prompt: `Close-up portrait of a young woman with shoulder-length brown hair, face filling more of the frame, looking directly at camera with slight smile, clean studio lighting, plain light gray background, sharp focus on facial features, natural skin texture visible, high quality photography. Age 25-30, natural makeup, wearing simple black top. Same person as reference.`,
  },
  {
    id: "char-good-5",
    prompt: `Portrait of a young woman with shoulder-length brown hair, slight head tilt, relaxed natural expression with soft smile, clean studio lighting, plain light gray background, sharp focus on face, natural skin texture, high quality photography. Age 25-30, natural makeup, wearing simple black top. Same person as reference.`,
  },
];

// ============================================================================
// CHARACTER BAD REFERENCES - Things to avoid
// ============================================================================
const characterBadPhotos = [
  {
    id: "char-bad-1",
    prompt: `Person wearing large dark sunglasses and a wide-brimmed hat, face mostly hidden and obscured by accessories, only mouth and chin slightly visible, outdoor setting, fashion style photo where face identity is not clear.`,
  },
  {
    id: "char-bad-2",
    prompt: `Group photo of 5 people standing together at a party or event, multiple faces visible, crowded frame, hard to identify which person is the main subject, casual snapshot quality, indoor party lighting.`,
  },
  {
    id: "char-bad-3",
    prompt: `Back of a person's head, looking completely away from camera, face not visible at all, outdoor setting, person walking away, only hair and back of neck visible.`,
  },
  {
    id: "char-bad-4",
    prompt: `Heavily filtered selfie with cartoon dog ears and nose filter overlay, AR face effects distorting facial features, sparkles and hearts around face, social media filter style, unrealistic skin smoothing.`,
  },
  {
    id: "char-bad-5",
    prompt: `Very dark underexposed photo of a person, face barely visible in deep shadow, harsh backlighting creating silhouette effect, person standing in front of bright window, facial features completely obscured by darkness.`,
  },
];

// ============================================================================
// PRODUCT GOOD REFERENCES - Clean product shots
// ============================================================================
const productGoodPhotos = [
  {
    id: "prod-good-1",
    prompt: `Clean product photography of a modern minimalist water bottle on pure white seamless background, professional studio lighting with soft shadows, centered composition, sharp focus, e-commerce packshot style, high quality commercial photography.`,
  },
  {
    id: "prod-good-2",
    prompt: `Professional product photo of premium wireless over-ear headphones on pure white seamless background, soft even studio lighting, high detail, crisp edges, centered composition, commercial photography style.`,
  },
  {
    id: "prod-good-3",
    prompt: `Studio product shot of an elegant skincare cream jar with silver lid on pure white seamless background, soft diffused lighting, clean reflections, label clearly visible, beauty product photography.`,
  },
  {
    id: "prod-good-4",
    prompt: `E-commerce style photo of a premium leather wallet at 3/4 angle on pure white seamless background, detailed leather texture visible, professional studio lighting, high quality product photography.`,
  },
  {
    id: "prod-good-5",
    prompt: `Clean packshot of a modern ceramic coffee mug on pure white seamless background, professional studio lighting, ceramic texture and glaze visible, centered composition, commercial product photography.`,
  },
];

// ============================================================================
// PRODUCT BAD REFERENCES - Things to avoid
// ============================================================================
const productBadPhotos = [
  {
    id: "prod-bad-1",
    prompt: `Extremely blurry out-of-focus photo of a product, heavy motion blur and camera shake, product shape barely recognizable, very low quality phone camera, cannot make out any details.`,
  },
  {
    id: "prod-bad-2",
    prompt: `Product partially hidden behind other objects, cluttered messy desk with papers and items covering most of the product, only small portion visible, distracting busy background, poor composition.`,
  },
  {
    id: "prod-bad-3",
    prompt: `Very dark underexposed photo of a product in shadow, barely visible, taken in dim room with no lighting, product details completely lost in darkness, amateur snapshot.`,
  },
  {
    id: "prod-bad-4",
    prompt: `Messy cluttered photo with multiple random products scattered together, confusing composition, impossible to tell which item is the main subject, chaotic arrangement on dirty surface.`,
  },
  {
    id: "prod-bad-5",
    prompt: `Product photo with harsh direct camera flash creating ugly white hotspots and glare, washed out colors, strong reflections obscuring product details, amateur flash photography.`,
  },
];

// ============================================================================
// CHARACTER PAGE PORTRAITS - 5 different people, same 3/4 pose, white background
// ============================================================================
const characterPortraits = [
  {
    id: "char-portrait-1",
    prompt: `Professional 3/4 body portrait of a young Asian woman in her late 20s, standing pose with hands relaxed at sides, wearing casual stylish outfit with white t-shirt and jeans, looking at camera with confident friendly expression, pure white seamless background, studio lighting, fashion photography style, high quality.`,
  },
  {
    id: "char-portrait-2",
    prompt: `Professional 3/4 body portrait of a young Black man in his early 30s, standing pose with hands relaxed at sides, wearing casual stylish outfit with gray henley shirt and dark pants, looking at camera with confident friendly expression, pure white seamless background, studio lighting, fashion photography style, high quality.`,
  },
  {
    id: "char-portrait-3",
    prompt: `Professional 3/4 body portrait of a young Caucasian woman with blonde hair in her mid 20s, standing pose with hands relaxed at sides, wearing casual stylish outfit with beige sweater and jeans, looking at camera with confident friendly expression, pure white seamless background, studio lighting, fashion photography style, high quality.`,
  },
  {
    id: "char-portrait-4",
    prompt: `Professional 3/4 body portrait of a middle-aged Latino man in his 40s, standing pose with hands relaxed at sides, wearing casual stylish outfit with navy blue polo and khakis, looking at camera with confident friendly expression, pure white seamless background, studio lighting, fashion photography style, high quality.`,
  },
  {
    id: "char-portrait-5",
    prompt: `Professional 3/4 body portrait of a young South Asian woman in her late 20s, standing pose with hands relaxed at sides, wearing casual stylish outfit with olive green blouse and black pants, looking at camera with confident friendly expression, pure white seamless background, studio lighting, fashion photography style, high quality.`,
  },
];

// ============================================================================
// PRODUCT PAGE IMAGES - Different products, same style, white background
// ============================================================================
const productPortraits = [
  {
    id: "prod-portrait-1",
    prompt: `Professional product photography of premium wireless earbuds in charging case on pure white seamless background, 3/4 angle view, soft studio lighting, sharp detail, modern tech product, commercial e-commerce style, high quality.`,
  },
  {
    id: "prod-portrait-2",
    prompt: `Professional product photography of a luxury wristwatch with leather strap on pure white seamless background, 3/4 angle view, soft studio lighting showing dial details, commercial e-commerce style, high quality.`,
  },
  {
    id: "prod-portrait-3",
    prompt: `Professional product photography of designer sunglasses on pure white seamless background, 3/4 angle view, soft studio lighting, clean reflections on lenses, commercial e-commerce style, high quality.`,
  },
  {
    id: "prod-portrait-4",
    prompt: `Professional product photography of a premium leather handbag on pure white seamless background, 3/4 angle view, soft studio lighting showing texture, commercial e-commerce style, high quality.`,
  },
  {
    id: "prod-portrait-5",
    prompt: `Professional product photography of modern running sneakers on pure white seamless background, 3/4 angle view, soft studio lighting, crisp details visible, commercial e-commerce style, high quality.`,
  },
];

async function createTask(prompt, aspectRatio = "1:1") {
  const response = await fetch(`${BASE_URL}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "seedream/4.5-text-to-image",
      input: {
        prompt,
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
  const taskId = data.data?.taskId || data.taskId;
  if (!taskId) {
    console.log("API Response:", JSON.stringify(data, null, 2));
    throw new Error("No taskId in response");
  }
  return taskId;
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

async function generateImages(photos, label, aspectRatio = "4:5") {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Generating ${label}`);
  console.log("=".repeat(60));

  const results = [];

  for (const photo of photos) {
    console.log(`\n[${photo.id}] Starting...`);
    console.log(`Prompt: ${photo.prompt.substring(0, 80)}...`);

    try {
      const taskId = await createTask(photo.prompt, aspectRatio);
      console.log(`Task: ${taskId}`);
      process.stdout.write("Waiting");

      const imageUrl = await waitForTask(taskId);
      console.log(""); // newline

      if (!imageUrl) {
        console.log(`[${photo.id}] No image URL returned`);
        continue;
      }

      const filename = `${photo.id}.jpg`;
      await downloadImage(imageUrl, filename);
      console.log(`[${photo.id}] Saved: ${filename}`);
      results.push({ id: photo.id, filename, success: true });
    } catch (error) {
      console.error(`[${photo.id}] Error: ${error.message}`);
      results.push({ id: photo.id, success: false, error: error.message });
    }
  }

  return results;
}

async function main() {
  const type = process.argv[2] || "all";

  console.log("=".repeat(60));
  console.log("Reference Image Generator");
  console.log("Using Kie.ai Seedream 4.5 API");
  console.log("=".repeat(60));
  console.log(`Type: ${type}`);
  console.log(`Output: ${OUTPUT_DIR}`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log("Created output directory");
  }

  const allResults = [];

  if (type === "character" || type === "all") {
    const goodResults = await generateImages(
      characterGoodPhotos,
      "Character Good References (same person, different angles)",
      "1:1"
    );
    allResults.push(...goodResults);

    const badResults = await generateImages(
      characterBadPhotos,
      "Character Bad References",
      "1:1"
    );
    allResults.push(...badResults);
  }

  if (type === "product" || type === "all") {
    const goodResults = await generateImages(
      productGoodPhotos,
      "Product Good References",
      "1:1"
    );
    allResults.push(...goodResults);

    const badResults = await generateImages(
      productBadPhotos,
      "Product Bad References",
      "1:1"
    );
    allResults.push(...badResults);
  }

  if (type === "pages" || type === "all") {
    const charPortraitResults = await generateImages(
      characterPortraits,
      "Character Page Portraits (5 different people, same pose)",
      "9:16"
    );
    allResults.push(...charPortraitResults);

    const prodPortraitResults = await generateImages(
      productPortraits,
      "Product Page Images (5 different products)",
      "1:1"
    );
    allResults.push(...prodPortraitResults);
  }

  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));

  const successful = allResults.filter((r) => r.success);
  const failed = allResults.filter((r) => !r.success);

  console.log(`\nSuccessful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log("\nFailed images:");
    failed.forEach((f) => console.log(`  - ${f.id}: ${f.error}`));
  }

  console.log("\n" + "=".repeat(60));
  console.log("DONE");
  console.log("=".repeat(60));
}

main().catch(console.error);
