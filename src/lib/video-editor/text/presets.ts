/**
 * Text Style Presets
 * Pre-configured text styles for common use cases
 */

import type {
  TextStyle,
  TextStylePreset,
  FontConfig,
  StrokeConfig,
  ShadowConfig,
  BackgroundConfig,
} from "./types";

// ============================================================================
// Style Building Helpers
// ============================================================================

function createStyle(options: {
  font: Partial<FontConfig> & { family: string; size: number };
  color: string;
  stroke?: StrokeConfig;
  shadow?: ShadowConfig;
  background?: BackgroundConfig;
  transform?: TextStyle["transform"];
  opacity?: number;
}): TextStyle {
  return {
    font: {
      family: options.font.family,
      size: options.font.size,
      weight: options.font.weight ?? "bold",
      lineHeight: options.font.lineHeight ?? 1.2,
      letterSpacing: options.font.letterSpacing ?? 0,
    },
    color: options.color,
    stroke: options.stroke,
    shadow: options.shadow,
    background: options.background,
    transform: options.transform,
    opacity: options.opacity,
  };
}

// ============================================================================
// Title Presets
// ============================================================================

export const TITLE_PRESETS: Record<string, TextStylePreset> = {
  // Bold Impact Title
  "title-impact": {
    name: "Impact Title",
    category: "title",
    description: "Bold, attention-grabbing title with thick stroke",
    defaultPosition: "middle-center",
    style: createStyle({
      font: { family: "Impact", size: 96, weight: "regular" },
      color: "#FFFFFF",
      stroke: { color: "#000000", width: 4 },
      shadow: { color: "rgba(0,0,0,0.8)", offsetX: 4, offsetY: 4 },
      transform: "uppercase",
    }),
  },

  // Modern Clean Title
  "title-modern": {
    name: "Modern Title",
    category: "title",
    description: "Clean, modern title with subtle shadow",
    defaultPosition: "middle-center",
    style: createStyle({
      font: { family: "Montserrat", size: 80, weight: "bold" },
      color: "#FFFFFF",
      shadow: { color: "rgba(0,0,0,0.5)", offsetX: 2, offsetY: 2, blur: 4 },
    }),
  },

  // Neon Glow Title
  "title-neon": {
    name: "Neon Title",
    category: "title",
    description: "Neon glow effect for attention-grabbing titles",
    defaultPosition: "middle-center",
    style: createStyle({
      font: { family: "Bebas Neue", size: 100, weight: "regular" },
      color: "#00FFFF",
      stroke: { color: "#FF00FF", width: 3 },
      shadow: { color: "#00FFFF", offsetX: 0, offsetY: 0, blur: 20 },
      transform: "uppercase",
    }),
  },

  // Playful Comic Title
  "title-comic": {
    name: "Comic Title",
    category: "title",
    description: "Fun, playful comic book style",
    defaultPosition: "middle-center",
    style: createStyle({
      font: {
        family: "Bangers",
        size: 90,
        weight: "regular",
        letterSpacing: 2,
      },
      color: "#FFFF00",
      stroke: { color: "#FF0000", width: 4 },
      shadow: { color: "#000000", offsetX: 6, offsetY: 6 },
      transform: "uppercase",
    }),
  },

  // Minimalist Title
  "title-minimal": {
    name: "Minimal Title",
    category: "title",
    description: "Clean, minimalist style",
    defaultPosition: "middle-center",
    style: createStyle({
      font: { family: "Inter", size: 72, weight: "light", letterSpacing: 4 },
      color: "#FFFFFF",
      transform: "uppercase",
    }),
  },

  // Cinematic Title
  "title-cinematic": {
    name: "Cinematic Title",
    category: "title",
    description: "Movie trailer style title",
    defaultPosition: "middle-center",
    style: createStyle({
      font: { family: "Oswald", size: 88, weight: "bold", letterSpacing: 8 },
      color: "#FFFFFF",
      stroke: { color: "#000000", width: 2 },
      transform: "uppercase",
    }),
  },
};

// ============================================================================
// Hook/CTA Presets (Short attention-grabbing text)
// ============================================================================

export const HOOK_PRESETS: Record<string, TextStylePreset> = {
  // TikTok Style Hook
  "hook-tiktok": {
    name: "TikTok Hook",
    category: "hook",
    description: "Bold, centered hook text like popular TikToks",
    defaultPosition: "middle-center",
    style: createStyle({
      font: { family: "Arial Black", size: 72, weight: "regular" },
      color: "#FFFFFF",
      stroke: { color: "#000000", width: 4 },
      transform: "uppercase",
    }),
  },

  // YouTube Thumbnail Style
  "hook-youtube": {
    name: "YouTube Hook",
    category: "hook",
    description: "YouTube thumbnail style text",
    defaultPosition: "bottom-center",
    style: createStyle({
      font: { family: "Anton", size: 80, weight: "regular" },
      color: "#FFFF00",
      stroke: { color: "#000000", width: 5 },
      shadow: { color: "#000000", offsetX: 4, offsetY: 4 },
      transform: "uppercase",
    }),
  },

  // Urgent/Breaking News Style
  "hook-urgent": {
    name: "Urgent Hook",
    category: "hook",
    description: "Breaking news / urgent style",
    defaultPosition: "top-center",
    style: createStyle({
      font: { family: "Roboto", size: 56, weight: "black" },
      color: "#FFFFFF",
      background: {
        color: "#FF0000",
        padding: { x: 24, y: 12 },
        borderRadius: 4,
      },
      transform: "uppercase",
    }),
  },

  // Question Hook
  "hook-question": {
    name: "Question Hook",
    category: "hook",
    description: "Engaging question style",
    defaultPosition: "middle-center",
    style: createStyle({
      font: { family: "Poppins", size: 64, weight: "bold" },
      color: "#FFFFFF",
      stroke: { color: "#000000", width: 3 },
    }),
  },

  // Highlight Hook
  "hook-highlight": {
    name: "Highlight Hook",
    category: "hook",
    description: "Highlighted key phrase",
    defaultPosition: "middle-center",
    style: createStyle({
      font: { family: "Montserrat", size: 60, weight: "extrabold" },
      color: "#000000",
      background: {
        color: "#FFFF00",
        padding: { x: 16, y: 8 },
        borderRadius: 4,
      },
      transform: "uppercase",
    }),
  },
};

// ============================================================================
// Subtitle/Caption Presets
// ============================================================================

export const SUBTITLE_PRESETS: Record<string, TextStylePreset> = {
  // Classic White on Black
  "subtitle-classic": {
    name: "Classic Subtitle",
    category: "subtitle",
    description: "Traditional white text with black outline",
    defaultPosition: "bottom-center",
    style: createStyle({
      font: { family: "Arial", size: 48, weight: "bold" },
      color: "#FFFFFF",
      stroke: { color: "#000000", width: 2 },
    }),
  },

  // TikTok Style Captions
  "subtitle-tiktok": {
    name: "TikTok Caption",
    category: "caption",
    description: "Bold centered captions like TikTok",
    defaultPosition: "middle-center",
    style: createStyle({
      font: { family: "Arial Black", size: 56, weight: "regular" },
      color: "#FFFFFF",
      stroke: { color: "#000000", width: 3 },
      transform: "uppercase",
    }),
  },

  // Netflix Style
  "subtitle-netflix": {
    name: "Netflix Style",
    category: "subtitle",
    description: "Clean Netflix-style subtitles",
    defaultPosition: "bottom-center",
    style: createStyle({
      font: { family: "Open Sans", size: 44, weight: "semibold" },
      color: "#FFFFFF",
      shadow: { color: "rgba(0,0,0,0.8)", offsetX: 2, offsetY: 2, blur: 4 },
    }),
  },

  // Boxed Subtitle
  "subtitle-boxed": {
    name: "Boxed Subtitle",
    category: "subtitle",
    description: "Text with semi-transparent background",
    defaultPosition: "bottom-center",
    style: createStyle({
      font: { family: "Roboto", size: 42, weight: "medium" },
      color: "#FFFFFF",
      background: {
        color: "rgba(0,0,0,0.7)",
        padding: { x: 16, y: 8 },
        borderRadius: 4,
      },
    }),
  },

  // Karaoke Style (for word highlighting)
  "subtitle-karaoke": {
    name: "Karaoke Style",
    category: "caption",
    description: "Word-by-word highlight style",
    defaultPosition: "bottom-center",
    style: createStyle({
      font: { family: "Poppins", size: 52, weight: "bold" },
      color: "#FFFFFF",
      background: {
        color: "rgba(0,0,0,0.6)",
        padding: { x: 12, y: 8 },
        borderRadius: 8,
      },
    }),
  },

  // MrBeast Style
  "subtitle-mrbeast": {
    name: "MrBeast Style",
    category: "caption",
    description: "Bold highlighted words like MrBeast videos",
    defaultPosition: "middle-center",
    style: createStyle({
      font: { family: "Impact", size: 64, weight: "regular" },
      color: "#FFFF00",
      stroke: { color: "#000000", width: 4 },
      background: {
        color: "#000000",
        padding: { x: 8, y: 4 },
      },
      transform: "uppercase",
    }),
  },
};

// ============================================================================
// Lower Third Presets
// ============================================================================

export const LOWER_THIRD_PRESETS: Record<string, TextStylePreset> = {
  // News Style Lower Third
  "lower-third-news": {
    name: "News Lower Third",
    category: "lower-third",
    description: "Professional news broadcast style",
    defaultPosition: "bottom-left",
    style: createStyle({
      font: { family: "Roboto", size: 36, weight: "bold" },
      color: "#FFFFFF",
      background: {
        color: "#1a1a1a",
        padding: { x: 20, y: 12 },
        border: { color: "#FF0000", width: 3 },
      },
    }),
  },

  // Modern Lower Third
  "lower-third-modern": {
    name: "Modern Lower Third",
    category: "lower-third",
    description: "Clean modern style name tag",
    defaultPosition: "bottom-left",
    style: createStyle({
      font: { family: "Inter", size: 32, weight: "semibold" },
      color: "#FFFFFF",
      background: {
        color: "rgba(0,0,0,0.8)",
        padding: { x: 24, y: 16 },
        borderRadius: 8,
      },
    }),
  },

  // Minimal Lower Third
  "lower-third-minimal": {
    name: "Minimal Lower Third",
    category: "lower-third",
    description: "Simple text with underline accent",
    defaultPosition: "bottom-left",
    style: createStyle({
      font: { family: "Montserrat", size: 28, weight: "medium" },
      color: "#FFFFFF",
      shadow: { color: "rgba(0,0,0,0.6)", offsetX: 1, offsetY: 1 },
    }),
  },
};

// ============================================================================
// CTA (Call-to-Action) Presets
// ============================================================================

export const CTA_PRESETS: Record<string, TextStylePreset> = {
  // Subscribe Button Style
  "cta-subscribe": {
    name: "Subscribe CTA",
    category: "cta",
    description: "YouTube subscribe button style",
    defaultPosition: "bottom-right",
    style: createStyle({
      font: { family: "Roboto", size: 32, weight: "bold" },
      color: "#FFFFFF",
      background: {
        color: "#FF0000",
        padding: { x: 20, y: 10 },
        borderRadius: 4,
      },
      transform: "uppercase",
    }),
  },

  // Swipe Up Style
  "cta-swipe": {
    name: "Swipe Up CTA",
    category: "cta",
    description: "Instagram swipe up style",
    defaultPosition: "bottom-center",
    style: createStyle({
      font: { family: "Poppins", size: 28, weight: "semibold" },
      color: "#FFFFFF",
      stroke: { color: "#000000", width: 1 },
    }),
  },

  // Link in Bio
  "cta-link": {
    name: "Link CTA",
    category: "cta",
    description: "Link in bio style",
    defaultPosition: "bottom-center",
    style: createStyle({
      font: { family: "Inter", size: 26, weight: "medium" },
      color: "#FFFFFF",
      background: {
        color: "rgba(0,0,0,0.7)",
        padding: { x: 16, y: 8 },
        borderRadius: 20,
      },
    }),
  },
};

// ============================================================================
// Combined Presets
// ============================================================================

/** All presets combined */
export const ALL_PRESETS: Record<string, TextStylePreset> = {
  ...TITLE_PRESETS,
  ...HOOK_PRESETS,
  ...SUBTITLE_PRESETS,
  ...LOWER_THIRD_PRESETS,
  ...CTA_PRESETS,
};

/**
 * Get all presets by category
 */
export function getPresetsByCategory(
  category: TextStylePreset["category"]
): TextStylePreset[] {
  return Object.values(ALL_PRESETS).filter(
    (preset) => preset.category === category
  );
}

/**
 * Get a preset by name
 */
export function getPreset(name: string): TextStylePreset | undefined {
  return ALL_PRESETS[name];
}

/**
 * Get all preset names
 */
export function getPresetNames(): string[] {
  return Object.keys(ALL_PRESETS);
}

/**
 * Get all preset categories
 */
export function getPresetCategories(): TextStylePreset["category"][] {
  return ["title", "hook", "subtitle", "caption", "lower-third", "cta"];
}
