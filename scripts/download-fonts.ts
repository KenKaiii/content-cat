#!/usr/bin/env npx tsx
/**
 * Font Download Script
 * Downloads recommended Google Fonts for video text overlays
 *
 * Usage:
 *   npx tsx scripts/download-fonts.ts
 *   npx tsx scripts/download-fonts.ts --list
 *   npx tsx scripts/download-fonts.ts --font "Montserrat"
 */

import { promises as fs, createWriteStream, unlinkSync } from "fs";
import * as path from "path";
import https from "https";

// ============================================================================
// Configuration
// ============================================================================

const FONTS_DIR = path.join(process.cwd(), "fonts");

/** Fonts to download from Google Fonts */
const GOOGLE_FONTS = [
  // Sans-serif (Clean, Modern)
  { family: "Montserrat", weights: [400, 500, 600, 700, 800, 900] },
  { family: "Roboto", weights: [400, 500, 700, 900] },
  { family: "Poppins", weights: [400, 500, 600, 700, 800, 900] },
  { family: "Inter", weights: [400, 500, 600, 700, 800, 900] },
  { family: "Open Sans", weights: [400, 600, 700, 800] },
  { family: "Oswald", weights: [400, 500, 600, 700] },

  // Display/Impact (Bold)
  { family: "Bebas Neue", weights: [400] },
  { family: "Anton", weights: [400] },
  { family: "Archivo Black", weights: [400] },
  { family: "Black Ops One", weights: [400] },
  { family: "Russo One", weights: [400] },

  // Fun/Creative
  { family: "Bangers", weights: [400] },
  { family: "Permanent Marker", weights: [400] },
  { family: "Pacifico", weights: [400] },
  { family: "Lobster", weights: [400] },
  { family: "Fredoka One", weights: [400] },
  { family: "Luckiest Guy", weights: [400] },
];

// ============================================================================
// Helpers
// ============================================================================

function log(message: string) {
  console.log(`[fonts] ${message}`);
}

function success(message: string) {
  console.log(`✅ ${message}`);
}

function error(message: string) {
  console.error(`❌ ${message}`);
}

/**
 * Download a file from URL
 */
async function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destPath);

    const request = https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          unlinkSync(destPath);
          downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        file.close();
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on("finish", () => {
        file.close();
        resolve();
      });
    });

    request.on("error", (err) => {
      file.close();
      reject(err);
    });

    file.on("error", (err: Error) => {
      file.close();
      reject(err);
    });
  });
}

/**
 * Fetch Google Fonts CSS and extract TTF URLs
 */
async function fetchGoogleFontUrls(
  family: string,
  weights: number[]
): Promise<Map<number, string>> {
  const urls = new Map<number, string>();

  // Use the Google Fonts CSS2 API
  const weightsParam = weights.join(";");
  const encodedFamily = encodeURIComponent(family);
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${weightsParam}&display=swap`;

  return new Promise((resolve, reject) => {
    https
      .get(
        cssUrl,
        {
          headers: {
            // Request TTF format by spoofing an older user agent
            "User-Agent":
              "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0",
          },
        },
        (response) => {
          let data = "";

          response.on("data", (chunk) => {
            data += chunk;
          });

          response.on("end", () => {
            // Parse CSS to extract font URLs
            // Looking for: src: url(...) format('truetype')
            const regex =
              /font-weight:\s*(\d+);[^}]*src:\s*url\(([^)]+\.ttf)\)/g;
            let match;

            while ((match = regex.exec(data)) !== null) {
              const weight = parseInt(match[1], 10);
              const url = match[2];
              urls.set(weight, url);
            }

            // Also try woff2 format and convert to ttf URL pattern
            const woff2Regex =
              /font-weight:\s*(\d+);[^}]*src:\s*url\(([^)]+)\)\s*format\(['"]woff2['"]\)/g;
            while ((match = woff2Regex.exec(data)) !== null) {
              const weight = parseInt(match[1], 10);
              if (!urls.has(weight)) {
                // Google Fonts doesn't provide direct TTF links in modern API
                // We'll use the woff2 URL as a reference
                urls.set(weight, match[2]);
              }
            }

            resolve(urls);
          });
        }
      )
      .on("error", reject);
  });
}

/**
 * Get weight name from numeric value
 */
function getWeightName(weight: number): string {
  const names: Record<number, string> = {
    100: "Thin",
    200: "ExtraLight",
    300: "Light",
    400: "Regular",
    500: "Medium",
    600: "SemiBold",
    700: "Bold",
    800: "ExtraBold",
    900: "Black",
  };
  return names[weight] || String(weight);
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Download a single font family
 */
async function downloadFont(
  family: string,
  weights: number[]
): Promise<boolean> {
  log(`Downloading ${family}...`);

  try {
    const urls = await fetchGoogleFontUrls(family, weights);

    if (urls.size === 0) {
      error(`No font URLs found for ${family}`);
      return false;
    }

    let downloaded = 0;

    for (const [weight, url] of urls) {
      const weightName = getWeightName(weight);
      const fileName = `${family.replace(/\s+/g, "")}-${weightName}.ttf`;
      const filePath = path.join(FONTS_DIR, fileName);

      // Check if already exists
      try {
        await fs.access(filePath);
        log(`  ${weightName} already exists, skipping`);
        downloaded++;
        continue;
      } catch {
        // File doesn't exist, download it
      }

      try {
        // Note: Google Fonts API returns woff2 by default now
        // For TTF, we need to use a different approach
        log(`  Downloading ${weightName}...`);

        // Try to download
        await downloadFile(url, filePath);
        downloaded++;
      } catch {
        log(`  Warning: Could not download ${weightName}`);
      }
    }

    if (downloaded > 0) {
      success(`${family}: ${downloaded}/${weights.length} weights downloaded`);
      return true;
    } else {
      error(`${family}: No weights could be downloaded`);
      return false;
    }
  } catch (err) {
    error(`Failed to download ${family}: ${err}`);
    return false;
  }
}

/**
 * List available fonts
 */
function listFonts() {
  console.log("\n📝 Available fonts to download:\n");

  console.log("Sans-serif (Clean, Modern):");
  console.log("  - Montserrat (400-900)");
  console.log("  - Roboto (400-900)");
  console.log("  - Poppins (400-900)");
  console.log("  - Inter (400-900)");
  console.log("  - Open Sans (400-800)");
  console.log("  - Oswald (400-700)");

  console.log("\nDisplay/Impact (Bold):");
  console.log("  - Bebas Neue");
  console.log("  - Anton");
  console.log("  - Archivo Black");
  console.log("  - Black Ops One");
  console.log("  - Russo One");

  console.log("\nFun/Creative:");
  console.log("  - Bangers");
  console.log("  - Permanent Marker");
  console.log("  - Pacifico");
  console.log("  - Lobster");
  console.log("  - Fredoka One");
  console.log("  - Luckiest Guy");

  console.log(
    "\n💡 Note: System fonts like Arial, Impact, Helvetica are already available."
  );
  console.log("\nRun without arguments to download all fonts.");
  console.log('Run with --font "FontName" to download a specific font.\n');
}

/**
 * Alternative: Generate shell script for manual download
 */
function generateManualInstructions() {
  console.log("\n📋 Manual Font Installation Instructions\n");
  console.log("Google Fonts has changed their API. For best results:");
  console.log("");
  console.log("1. Visit https://fonts.google.com");
  console.log("2. Search for each font and click 'Download family'");
  console.log("3. Extract the TTF files to the 'fonts' directory");
  console.log("");
  console.log("Or use Homebrew on macOS:");
  console.log("  brew tap homebrew/cask-fonts");
  console.log("  brew install --cask font-montserrat");
  console.log("  brew install --cask font-roboto");
  console.log("  brew install --cask font-poppins");
  console.log("  # etc.");
  console.log("");
  console.log("Font URLs for direct download:");

  for (const font of GOOGLE_FONTS) {
    const encodedFamily = encodeURIComponent(font.family);
    console.log(
      `  ${font.family}: https://fonts.google.com/specimen/${encodedFamily}`
    );
  }
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  // Handle --list flag
  if (args.includes("--list")) {
    listFonts();
    return;
  }

  // Handle --help flag
  if (args.includes("--help") || args.includes("-h")) {
    console.log("\nUsage:");
    console.log(
      "  npx tsx scripts/download-fonts.ts          Download all fonts"
    );
    console.log(
      "  npx tsx scripts/download-fonts.ts --list   List available fonts"
    );
    console.log(
      '  npx tsx scripts/download-fonts.ts --font "Montserrat"  Download specific font'
    );
    console.log(
      "  npx tsx scripts/download-fonts.ts --manual Show manual install instructions"
    );
    return;
  }

  // Handle --manual flag
  if (args.includes("--manual")) {
    generateManualInstructions();
    return;
  }

  console.log("\n🔤 Font Downloader\n");

  // Create fonts directory
  await fs.mkdir(FONTS_DIR, { recursive: true });
  log(`Fonts directory: ${FONTS_DIR}`);

  // Handle --font flag for specific font
  const fontIndex = args.indexOf("--font");
  if (fontIndex !== -1 && args[fontIndex + 1]) {
    const fontName = args[fontIndex + 1];
    const fontConfig = GOOGLE_FONTS.find(
      (f) => f.family.toLowerCase() === fontName.toLowerCase()
    );

    if (fontConfig) {
      await downloadFont(fontConfig.family, fontConfig.weights);
    } else {
      error(`Font "${fontName}" not found in the list`);
      console.log("Use --list to see available fonts");
    }
    return;
  }

  // Download all fonts
  log("Attempting to download fonts from Google Fonts...\n");
  log("Note: Google Fonts API may not provide direct TTF downloads.");
  log("If downloads fail, use --manual for alternative instructions.\n");

  let succeeded = 0;
  let failed = 0;

  for (const font of GOOGLE_FONTS) {
    const result = await downloadFont(font.family, font.weights);
    if (result) {
      succeeded++;
    } else {
      failed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`\nResults: ${succeeded} fonts downloaded, ${failed} failed`);

  if (failed > 0) {
    console.log("\nFor fonts that failed, run:");
    console.log("  npx tsx scripts/download-fonts.ts --manual");
  }

  console.log(`\nFonts installed to: ${FONTS_DIR}`);
}

main().catch(console.error);
