/**
 * Font Management
 * Font metadata, availability checking, and download helpers
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import * as path from "path";
import type { FontWeight, FontMetadata } from "./types";

// ============================================================================
// Font Definitions
// ============================================================================

/** All supported fonts with metadata */
export const FONTS: Record<string, FontMetadata> = {
  // ==========================================================================
  // Sans-Serif (Clean, Modern, Readable)
  // ==========================================================================
  Montserrat: {
    family: "Montserrat",
    displayName: "Montserrat",
    category: "sans-serif",
    weights: [
      "thin",
      "extralight",
      "light",
      "regular",
      "medium",
      "semibold",
      "bold",
      "extrabold",
      "black",
    ],
    googleFontsUrl: "https://fonts.google.com/specimen/Montserrat",
    recommendedFor: ["titles", "subtitles", "captions"],
  },
  Roboto: {
    family: "Roboto",
    displayName: "Roboto",
    category: "sans-serif",
    weights: ["thin", "light", "regular", "medium", "bold", "black"],
    googleFontsUrl: "https://fonts.google.com/specimen/Roboto",
    recommendedFor: ["subtitles", "captions"],
  },
  Poppins: {
    family: "Poppins",
    displayName: "Poppins",
    category: "sans-serif",
    weights: [
      "thin",
      "extralight",
      "light",
      "regular",
      "medium",
      "semibold",
      "bold",
      "extrabold",
      "black",
    ],
    googleFontsUrl: "https://fonts.google.com/specimen/Poppins",
    recommendedFor: ["titles", "subtitles", "captions", "hooks"],
  },
  Inter: {
    family: "Inter",
    displayName: "Inter",
    category: "sans-serif",
    weights: [
      "thin",
      "extralight",
      "light",
      "regular",
      "medium",
      "semibold",
      "bold",
      "extrabold",
      "black",
    ],
    googleFontsUrl: "https://fonts.google.com/specimen/Inter",
    recommendedFor: ["subtitles", "captions"],
  },
  "Open Sans": {
    family: "Open Sans",
    displayName: "Open Sans",
    category: "sans-serif",
    weights: ["light", "regular", "medium", "semibold", "bold", "extrabold"],
    googleFontsUrl: "https://fonts.google.com/specimen/Open+Sans",
    recommendedFor: ["subtitles", "captions"],
  },
  Oswald: {
    family: "Oswald",
    displayName: "Oswald",
    category: "sans-serif",
    weights: ["extralight", "light", "regular", "medium", "semibold", "bold"],
    googleFontsUrl: "https://fonts.google.com/specimen/Oswald",
    recommendedFor: ["titles", "hooks"],
  },

  // ==========================================================================
  // Display/Impact (Bold, Attention-Grabbing)
  // ==========================================================================
  "Bebas Neue": {
    family: "Bebas Neue",
    displayName: "Bebas Neue",
    category: "display",
    weights: ["regular"],
    googleFontsUrl: "https://fonts.google.com/specimen/Bebas+Neue",
    recommendedFor: ["titles", "hooks"],
  },
  Anton: {
    family: "Anton",
    displayName: "Anton",
    category: "display",
    weights: ["regular"],
    googleFontsUrl: "https://fonts.google.com/specimen/Anton",
    recommendedFor: ["titles", "hooks"],
  },
  Impact: {
    family: "Impact",
    displayName: "Impact",
    category: "display",
    weights: ["regular"],
    recommendedFor: ["titles", "hooks"],
  },
  "Archivo Black": {
    family: "Archivo Black",
    displayName: "Archivo Black",
    category: "display",
    weights: ["regular"],
    googleFontsUrl: "https://fonts.google.com/specimen/Archivo+Black",
    recommendedFor: ["titles", "hooks"],
  },
  "Black Ops One": {
    family: "Black Ops One",
    displayName: "Black Ops One",
    category: "display",
    weights: ["regular"],
    googleFontsUrl: "https://fonts.google.com/specimen/Black+Ops+One",
    recommendedFor: ["titles", "hooks"],
  },
  "Russo One": {
    family: "Russo One",
    displayName: "Russo One",
    category: "display",
    weights: ["regular"],
    googleFontsUrl: "https://fonts.google.com/specimen/Russo+One",
    recommendedFor: ["titles", "hooks"],
  },

  // ==========================================================================
  // Fun/Creative (Playful, Casual)
  // ==========================================================================
  Bangers: {
    family: "Bangers",
    displayName: "Bangers",
    category: "display",
    weights: ["regular"],
    googleFontsUrl: "https://fonts.google.com/specimen/Bangers",
    recommendedFor: ["titles", "hooks"],
  },
  "Permanent Marker": {
    family: "Permanent Marker",
    displayName: "Permanent Marker",
    category: "handwriting",
    weights: ["regular"],
    googleFontsUrl: "https://fonts.google.com/specimen/Permanent+Marker",
    recommendedFor: ["titles", "hooks"],
  },
  Pacifico: {
    family: "Pacifico",
    displayName: "Pacifico",
    category: "handwriting",
    weights: ["regular"],
    googleFontsUrl: "https://fonts.google.com/specimen/Pacifico",
    recommendedFor: ["titles"],
  },
  Lobster: {
    family: "Lobster",
    displayName: "Lobster",
    category: "handwriting",
    weights: ["regular"],
    googleFontsUrl: "https://fonts.google.com/specimen/Lobster",
    recommendedFor: ["titles"],
  },
  "Fredoka One": {
    family: "Fredoka One",
    displayName: "Fredoka One",
    category: "display",
    weights: ["regular"],
    googleFontsUrl: "https://fonts.google.com/specimen/Fredoka+One",
    recommendedFor: ["titles", "hooks"],
  },
  "Luckiest Guy": {
    family: "Luckiest Guy",
    displayName: "Luckiest Guy",
    category: "display",
    weights: ["regular"],
    googleFontsUrl: "https://fonts.google.com/specimen/Luckiest+Guy",
    recommendedFor: ["titles", "hooks"],
  },

  // ==========================================================================
  // System Fallbacks (Always Available)
  // ==========================================================================
  Arial: {
    family: "Arial",
    displayName: "Arial",
    category: "sans-serif",
    weights: ["regular", "bold"],
    recommendedFor: ["subtitles", "captions"],
  },
  "Arial Black": {
    family: "Arial Black",
    displayName: "Arial Black",
    category: "sans-serif",
    weights: ["regular"],
    recommendedFor: ["titles", "hooks"],
  },
  Helvetica: {
    family: "Helvetica",
    displayName: "Helvetica",
    category: "sans-serif",
    weights: ["light", "regular", "bold"],
    recommendedFor: ["subtitles", "captions"],
  },
  Verdana: {
    family: "Verdana",
    displayName: "Verdana",
    category: "sans-serif",
    weights: ["regular", "bold"],
    recommendedFor: ["subtitles", "captions"],
  },
};

// ============================================================================
// Font Weight Mapping
// ============================================================================

/** Map font weight names to numeric values */
export const FONT_WEIGHT_VALUES: Record<FontWeight, number> = {
  thin: 100,
  extralight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

/** Get numeric weight value */
export function getFontWeightValue(weight: FontWeight): number {
  return FONT_WEIGHT_VALUES[weight];
}

// ============================================================================
// Font Availability Checking
// ============================================================================

/** Cache for font availability */
const fontAvailabilityCache: Map<string, boolean> = new Map();

/**
 * Check if a font is available on the system
 */
export function isFontAvailable(fontFamily: string): boolean {
  // Check cache first
  if (fontAvailabilityCache.has(fontFamily)) {
    return fontAvailabilityCache.get(fontFamily)!;
  }

  try {
    // Use fc-list to check if font exists
    const result = execSync(`fc-list : family | grep -i "${fontFamily}"`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const available = result.trim().length > 0;
    fontAvailabilityCache.set(fontFamily, available);
    return available;
  } catch {
    fontAvailabilityCache.set(fontFamily, false);
    return false;
  }
}

/**
 * Get all available fonts with their availability status
 */
export function getAvailableFonts(): FontMetadata[] {
  return Object.values(FONTS).map((font) => ({
    ...font,
    isAvailable: isFontAvailable(font.family),
  }));
}

/**
 * Get fonts by category
 */
export function getFontsByCategory(
  category: FontMetadata["category"]
): FontMetadata[] {
  return Object.values(FONTS).filter((font) => font.category === category);
}

/**
 * Get fonts recommended for a specific use
 */
export function getFontsForUse(
  use: "titles" | "subtitles" | "captions" | "hooks"
): FontMetadata[] {
  return Object.values(FONTS).filter((font) =>
    font.recommendedFor.includes(use)
  );
}

/**
 * Get a fallback font if requested font is unavailable
 */
export function getFontWithFallback(fontFamily: string): string {
  if (isFontAvailable(fontFamily)) {
    return fontFamily;
  }

  // Try common fallbacks
  const fallbacks = ["Arial", "Helvetica", "sans-serif"];
  for (const fallback of fallbacks) {
    if (isFontAvailable(fallback)) {
      console.warn(`Font "${fontFamily}" not available, using "${fallback}"`);
      return fallback;
    }
  }

  return "sans-serif";
}

// ============================================================================
// Font File Paths
// ============================================================================

/** Default fonts directory */
export const FONTS_DIR = path.join(process.cwd(), "fonts");

/**
 * Get the path to a font file
 */
export function getFontPath(
  fontFamily: string,
  weight: FontWeight = "regular"
): string | null {
  const weightValue = FONT_WEIGHT_VALUES[weight];
  const possibleNames = [
    `${fontFamily.replace(/\s+/g, "")}-${weight}.ttf`,
    `${fontFamily.replace(/\s+/g, "")}-${weightValue}.ttf`,
    `${fontFamily.replace(/\s+/g, "")}.ttf`,
    `${fontFamily.replace(/\s+/g, "-")}-${weight}.ttf`,
    `${fontFamily.replace(/\s+/g, "-")}.ttf`,
  ];

  for (const name of possibleNames) {
    const fontPath = path.join(FONTS_DIR, name);
    if (existsSync(fontPath)) {
      return fontPath;
    }
  }

  return null;
}

// ============================================================================
// Google Fonts Download URLs
// ============================================================================

/** Google Fonts API base URL */
const GOOGLE_FONTS_CSS_URL = "https://fonts.googleapis.com/css2";

/**
 * Generate Google Fonts CSS URL for a font
 */
export function getGoogleFontsCssUrl(
  fontFamily: string,
  weights: FontWeight[] = ["regular", "bold"]
): string {
  const weightValues = weights.map(getFontWeightValue).join(";");
  const encodedFamily = encodeURIComponent(fontFamily);
  return `${GOOGLE_FONTS_CSS_URL}?family=${encodedFamily}:wght@${weightValues}&display=swap`;
}

/**
 * Get download info for fonts that need to be installed
 */
export function getMissingFonts(): FontMetadata[] {
  return Object.values(FONTS).filter(
    (font) => font.googleFontsUrl && !isFontAvailable(font.family)
  );
}
