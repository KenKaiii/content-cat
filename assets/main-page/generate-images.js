/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Image Generation Script for Main Page
 * Uses Kie.ai Seedream 4.5 API to generate all placeholder images
 *
 * Usage: node generate-images.js
 */

const fs = require("fs");
const path = require("path");

const API_KEY = "4c6bec602d48c03944dc57c88d39dee3";
const BASE_URL = "https://api.kie.ai";
const OUTPUT_DIR = path.join(__dirname);

// All images to generate with creative prompts based on titles/descriptions
const imagesToGenerate = [
  // FeaturedCards images (16:9 aspect ratio)
  {
    filename: "holiday-sales.jpg",
    aspectRatio: "16:9",
    prompt:
      'Festive holiday sale promotional banner with magical snowflakes, golden gift boxes, glowing discount tags showing "67% OFF", warm Christmas lights bokeh background, luxurious red and gold color scheme, professional marketing visual, high-end retail aesthetic',
  },
  {
    filename: "inpaint.jpg",
    aspectRatio: "16:9",
    prompt:
      "Digital art showing AI inpainting concept, a photo being edited with glowing brush strokes, before and after transformation effect, magical particles where the brush touches, sleek dark UI interface elements, futuristic creative tool visualization",
  },
  {
    filename: "shots.jpg",
    aspectRatio: "16:9",
    prompt:
      "Grid of 9 different camera angle shots of a beautiful portrait, showing variety from one source image, professional photography studio lighting, elegant composition showing multiple perspectives, cinematic quality, dark modern interface aesthetic",
  },
  {
    filename: "ai-portraits.jpg",
    aspectRatio: "16:9",
    prompt:
      "Stunning AI-generated portrait gallery, beautiful diverse faces with perfect lighting, professional headshots with artistic flair, glowing neural network patterns subtly in background, high-fashion photography aesthetic, premium quality portraits",
  },
  {
    filename: "video-gen.jpg",
    aspectRatio: "16:9",
    prompt:
      "AI video generation concept art, text transforming into cinematic video frames, movie clapperboard with digital effects, flowing timeline with video thumbnails, neon blue and purple accents, futuristic content creation visualization",
  },
  {
    filename: "upscaler.jpg",
    aspectRatio: "16:9",
    prompt:
      "Image upscaling visualization showing pixelated photo transforming to crystal clear 8K resolution, magnifying glass revealing enhanced details, before-after comparison split screen, sharp crisp details emerging, technical enhancement concept art",
  },
  {
    filename: "style-mix.jpg",
    aspectRatio: "16:9",
    prompt:
      "Artistic style mixing visualization, Van Gogh starry night blending with cyberpunk neon, watercolor merging with digital art, swirling colors and artistic styles combining, creative fusion of multiple art movements, vibrant palette explosion",
  },
  {
    filename: "animate.jpg",
    aspectRatio: "16:9",
    prompt:
      "Still photograph coming to life with motion trails, butterfly wings starting to flutter, flowing hair with movement particles, magical sparkles indicating animation, static to dynamic transformation, cinematic motion blur effects",
  },

  // TopChoice images (1:1 aspect ratio for square cards - h-40 x min-w-160px)
  {
    filename: "nano-banana.jpg",
    aspectRatio: "1:1",
    prompt:
      "Ultra high resolution 4K AI art showcase, photorealistic golden banana with crystalline details, premium quality demonstration, sharp intricate textures visible at macro level, luxurious dark background, flagship AI model visualization",
  },
  {
    filename: "skin-enhancer.jpg",
    aspectRatio: "1:1",
    prompt:
      "Close-up of flawless natural skin texture, professional beauty retouching result, pores and fine details visible but perfected, soft studio lighting on face, dermatology-grade skin enhancement, realistic human skin macro photography",
  },
  {
    filename: "kling.jpg",
    aspectRatio: "1:1",
    prompt:
      "Cinematic video production concept, film camera with audio waveforms, movie scene with dramatic lighting, professional cinematography aesthetic, sound waves visualized, Hollywood quality video creation, director chair and clapperboard",
  },
  {
    filename: "face-swap.jpg",
    aspectRatio: "1:1",
    prompt:
      "Face swap technology visualization, two faces morphing and blending seamlessly, digital face mesh overlay, AI face mapping concept, smooth transition between identities, futuristic biometric technology aesthetic",
  },
  {
    filename: "angles.jpg",
    aspectRatio: "1:1",
    prompt:
      "3D object shown from multiple angles, rotating view visualization, wireframe to rendered transition, camera orbiting around subject, multiple perspective views arranged in circle, technical 3D visualization concept",
  },
  {
    filename: "seedream.jpg",
    aspectRatio: "1:1",
    prompt:
      "Next generation 4K AI image generation, dreamy surreal landscape with impossible architecture, crystalline structures reflecting light, ultra detailed fantasy scene, premium quality digital art, cutting-edge AI creativity showcase",
  },
  {
    filename: "portrait-master.jpg",
    aspectRatio: "1:1",
    prompt:
      "Professional portrait photography studio setup, ring light reflections in eyes, perfect skin tones, editorial fashion portrait quality, expert lighting and composition, high-end portrait retouching result",
  },
  {
    filename: "background-remix.jpg",
    aspectRatio: "1:1",
    prompt:
      "Subject with transforming backgrounds, city becoming beach becoming mountains, seamless background replacement visualization, person staying static while environment morphs, magical portal effect around subject",
  },
  {
    filename: "style-transfer.jpg",
    aspectRatio: "1:1",
    prompt:
      "Photograph transforming into oil painting, artistic style transfer in progress, brushstrokes appearing over photo, Renaissance art style emerging from modern photo, instant artistic transformation visualization",
  },
  {
    filename: "video-upscale.jpg",
    aspectRatio: "1:1",
    prompt:
      "Video frame being enhanced to 4K resolution, film grain becoming crystal clear, old footage restoration visualization, enhancement particles and sharpening effects, video quality transformation concept",
  },
  {
    filename: "motion-blur.jpg",
    aspectRatio: "1:1",
    prompt:
      "Cinematic motion blur effect on race car, speed lines and dynamic movement, professional film motion effect, dramatic action photography with blur trails, high-speed cinematography aesthetic",
  },
  {
    filename: "color-grade.jpg",
    aspectRatio: "1:1",
    prompt:
      "Professional color grading visualization, color wheels and curves adjustment, cinematic teal and orange grade, before after color correction split, film look transformation, Hollywood color science aesthetic",
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
  // taskId is nested under data
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
  // Response is nested under data
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
      // Parse resultJson string to get URLs
      if (result.resultJson) {
        const parsed = JSON.parse(result.resultJson);
        result.imageUrls = parsed.resultUrls || [];
      }
      return result;
    } else if (result.state === "failed" || result.state === "error") {
      throw new Error(`Task failed: ${result.failMsg || "Unknown error"}`);
    }

    // Still processing (waiting/processing), wait and retry
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
    // Create the task
    const taskId = await createTask(prompt, aspectRatio);
    console.log(`  Task ID: ${taskId}`);

    // Wait for completion
    console.log(`  Waiting for completion...`);
    const result = await waitForTask(taskId);

    // Download the image
    const imageUrl = result.imageUrls?.[0];
    if (!imageUrl) {
      console.log("  Result:", JSON.stringify(result, null, 2));
      throw new Error("No image URL in result");
    }
    console.log(""); // newline after progress dots

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
  console.log("Main Page Image Generator");
  console.log("Using Kie.ai Seedream 4.5 API");
  console.log("=".repeat(60));
  console.log(`\nOutput directory: ${OUTPUT_DIR}`);
  console.log(`Total images to generate: ${imagesToGenerate.length}`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = [];

  // Generate images sequentially to avoid rate limits
  for (let i = 0; i < imagesToGenerate.length; i++) {
    console.log(`\n[${i + 1}/${imagesToGenerate.length}]`);
    const result = await generateImage(imagesToGenerate[i]);
    results.push(result);

    // Small delay between requests
    if (i < imagesToGenerate.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
    console.log(`\nFailed images:`);
    failed.forEach((f) => console.log(`  - ${f.filename}: ${f.error}`));
  }

  // Save results log
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
