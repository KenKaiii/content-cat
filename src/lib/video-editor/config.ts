/**
 * Video Editor Configuration
 * Presets, defaults, and configuration helpers
 */

import type {
  AspectRatio,
  Resolution,
  ResolutionDimensions,
  SubtitleStyle,
  Transition,
  TransitionType,
  OutputConfig,
  VideoFormat,
} from "./types";

// ============================================================================
// Resolution Mappings
// ============================================================================

/** Resolution dimensions for each preset */
export const RESOLUTION_MAP: Record<Resolution, ResolutionDimensions> = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "4k": { width: 3840, height: 2160 },
};

/** Get dimensions for aspect ratio and resolution */
export function getDimensions(
  aspectRatio: AspectRatio,
  resolution: Resolution
): ResolutionDimensions {
  const base = RESOLUTION_MAP[resolution];

  // For vertical video, we flip the dimensions
  // 1080p horizontal = 1920x1080, vertical = 1080x1920
  switch (aspectRatio) {
    case "9:16": // Vertical (TikTok, Reels, Shorts)
      return { width: base.height, height: base.width }; // 1080x1920 for 1080p
    case "16:9": // Horizontal (YouTube)
      return { width: base.width, height: base.height }; // 1920x1080 for 1080p
    case "1:1": // Square (Instagram)
      return { width: base.height, height: base.height }; // 1080x1080 for 1080p
    case "4:5": // Portrait (Instagram Feed)
      return { width: Math.round(base.height * (4 / 5)), height: base.height }; // 864x1080 for 1080p
    default:
      return base;
  }
}

// ============================================================================
// Short-Form Presets
// ============================================================================

/** Platform-specific presets */
export const PLATFORM_PRESETS = {
  tiktok: {
    aspectRatio: "9:16" as AspectRatio,
    resolution: "1080p" as Resolution,
    fps: 30,
    maxDuration: 180, // 3 minutes
    videoBitrate: "8M",
    audioBitrate: "192k",
  },
  reels: {
    aspectRatio: "9:16" as AspectRatio,
    resolution: "1080p" as Resolution,
    fps: 30,
    maxDuration: 90, // 90 seconds
    videoBitrate: "8M",
    audioBitrate: "192k",
  },
  shorts: {
    aspectRatio: "9:16" as AspectRatio,
    resolution: "1080p" as Resolution,
    fps: 30,
    maxDuration: 60, // 60 seconds
    videoBitrate: "8M",
    audioBitrate: "192k",
  },
  youtube: {
    aspectRatio: "16:9" as AspectRatio,
    resolution: "1080p" as Resolution,
    fps: 30,
    maxDuration: null, // No limit
    videoBitrate: "10M",
    audioBitrate: "256k",
  },
  instagram_feed: {
    aspectRatio: "4:5" as AspectRatio,
    resolution: "1080p" as Resolution,
    fps: 30,
    maxDuration: 60,
    videoBitrate: "6M",
    audioBitrate: "192k",
  },
} as const;

export type Platform = keyof typeof PLATFORM_PRESETS;

/** Get output config for a platform */
export function getOutputConfigForPlatform(
  platform: Platform,
  outputPath: string
): OutputConfig {
  const preset = PLATFORM_PRESETS[platform];
  return {
    path: outputPath,
    format: "mp4",
    aspectRatio: preset.aspectRatio,
    resolution: preset.resolution,
    fps: preset.fps,
    videoBitrate: preset.videoBitrate,
    audioBitrate: preset.audioBitrate,
    quality: "high",
  };
}

// ============================================================================
// Subtitle Style Presets
// ============================================================================

/** Pre-configured subtitle styles */
export const SUBTITLE_PRESETS = {
  /** Classic white text with black outline */
  classic: {
    fontFamily: "Arial",
    fontSize: 48,
    fontColor: "#FFFFFF",
    fontWeight: "bold",
    strokeColor: "#000000",
    strokeWidth: 2,
    positionY: 0.85,
    align: "center",
    animation: "none",
  } as SubtitleStyle,

  /** TikTok-style bold captions */
  tiktok: {
    fontFamily: "Arial Black",
    fontSize: 56,
    fontColor: "#FFFFFF",
    fontWeight: "bolder",
    strokeColor: "#000000",
    strokeWidth: 3,
    positionY: 0.5, // Center of screen
    align: "center",
    textTransform: "uppercase",
    animation: "pop",
  } as SubtitleStyle,

  /** Word highlight style (like MrBeast) */
  highlight: {
    fontFamily: "Impact",
    fontSize: 64,
    fontColor: "#FFFF00",
    backgroundColor: "#000000",
    backgroundPadding: 8,
    backgroundRadius: 4,
    fontWeight: "bold",
    positionY: 0.5,
    align: "center",
    animation: "highlight",
  } as SubtitleStyle,

  /** Minimal clean style */
  minimal: {
    fontFamily: "Helvetica Neue",
    fontSize: 42,
    fontColor: "#FFFFFF",
    fontWeight: "normal",
    positionY: 0.9,
    align: "center",
    animation: "fade",
  } as SubtitleStyle,

  /** Neon glow effect */
  neon: {
    fontFamily: "Arial Black",
    fontSize: 52,
    fontColor: "#00FFFF",
    strokeColor: "#FF00FF",
    strokeWidth: 2,
    fontWeight: "bold",
    positionY: 0.5,
    align: "center",
    animation: "pop",
  } as SubtitleStyle,

  /** Karaoke-style with background box */
  karaoke: {
    fontFamily: "Arial",
    fontSize: 48,
    fontColor: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    backgroundPadding: 12,
    backgroundRadius: 8,
    fontWeight: "bold",
    positionY: 0.85,
    align: "center",
    animation: "highlight",
  } as SubtitleStyle,
} as const;

export type SubtitlePreset = keyof typeof SUBTITLE_PRESETS;

// ============================================================================
// Transition Presets
// ============================================================================

/** Quick transition presets */
export const TRANSITION_PRESETS = {
  /** No transition */
  none: { type: "none", duration: 0 } as Transition,

  /** Quick fade */
  quickFade: { type: "fade", duration: 0.3, easing: "easeInOut" } as Transition,

  /** Standard crossfade */
  crossfade: {
    type: "crossfade",
    duration: 0.5,
    easing: "easeInOut",
  } as Transition,

  /** Smooth slide */
  slideLeft: {
    type: "slideLeft",
    duration: 0.4,
    easing: "easeOut",
  } as Transition,

  /** TikTok-style glitch */
  glitch: { type: "glitch", duration: 0.2, easing: "linear" } as Transition,

  /** Flash transition */
  flash: { type: "flash", duration: 0.15, easing: "linear" } as Transition,

  /** Zoom in */
  zoomIn: { type: "zoomIn", duration: 0.4, easing: "easeOut" } as Transition,
} as const;

export type TransitionPreset = keyof typeof TRANSITION_PRESETS;

/** All available transition types */
export const AVAILABLE_TRANSITIONS: TransitionType[] = [
  "none",
  "fade",
  "crossfade",
  "slideLeft",
  "slideRight",
  "slideUp",
  "slideDown",
  "zoomIn",
  "zoomOut",
  "wipeLeft",
  "wipeRight",
  "wipeUp",
  "wipeDown",
  "blur",
  "pixelize",
  "rotate",
  "flip",
  "glitch",
  "flash",
  "shake",
];

// ============================================================================
// Quality Presets
// ============================================================================

/** Quality settings for different use cases */
export const QUALITY_PRESETS = {
  draft: {
    videoBitrate: "2M",
    audioBitrate: "128k",
    fps: 24,
  },
  normal: {
    videoBitrate: "5M",
    audioBitrate: "192k",
    fps: 30,
  },
  high: {
    videoBitrate: "8M",
    audioBitrate: "256k",
    fps: 30,
  },
  best: {
    videoBitrate: "15M",
    audioBitrate: "320k",
    fps: 60,
  },
} as const;

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULTS = {
  /** Default video format */
  format: "mp4" as VideoFormat,

  /** Default aspect ratio (vertical for short-form) */
  aspectRatio: "9:16" as AspectRatio,

  /** Default resolution */
  resolution: "1080p" as Resolution,

  /** Default frame rate */
  fps: 30,

  /** Default transition */
  transition: TRANSITION_PRESETS.quickFade,

  /** Default subtitle style */
  subtitleStyle: SUBTITLE_PRESETS.tiktok,

  /** Default audio volume */
  volume: 1.0,

  /** Default background music volume */
  musicVolume: 0.3,

  /** Default fade duration for audio */
  audioFadeDuration: 1.0,
} as const;

// ============================================================================
// Validation Helpers
// ============================================================================

/** Validate aspect ratio */
export function isValidAspectRatio(value: string): value is AspectRatio {
  return ["9:16", "16:9", "1:1", "4:5"].includes(value);
}

/** Validate resolution */
export function isValidResolution(value: string): value is Resolution {
  return ["720p", "1080p", "4k"].includes(value);
}

/** Validate transition type */
export function isValidTransitionType(value: string): value is TransitionType {
  return AVAILABLE_TRANSITIONS.includes(value as TransitionType);
}

/** Get file extension for format */
export function getFileExtension(format: VideoFormat): string {
  return `.${format}`;
}
