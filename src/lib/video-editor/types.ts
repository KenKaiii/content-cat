/**
 * Video Editor Types
 * Core TypeScript interfaces for video editing operations
 */

// ============================================================================
// Base Types
// ============================================================================

/** Supported video formats */
export type VideoFormat = "mp4" | "webm" | "mov";

/** Supported audio formats */
export type AudioFormat = "mp3" | "wav" | "aac" | "m4a";

/** Aspect ratios optimized for short-form content */
export type AspectRatio = "9:16" | "16:9" | "1:1" | "4:5";

/** Resolution presets */
export type Resolution = "720p" | "1080p" | "4k";

/** Resolution dimensions mapping */
export interface ResolutionDimensions {
  width: number;
  height: number;
}

// ============================================================================
// Video Clip Types
// ============================================================================

/** Represents a single video clip */
export interface VideoClip {
  /** Unique identifier for the clip */
  id: string;
  /** Path or URL to the video file */
  source: string;
  /** Start time in seconds (for trimming) */
  startTime?: number;
  /** End time in seconds (for trimming) */
  endTime?: number;
  /** Duration in seconds (calculated or explicit) */
  duration?: number;
  /** Volume level (0-1, default 1) */
  volume?: number;
  /** Whether to mute the clip's audio */
  muted?: boolean;
}

/** Represents an audio track */
export interface AudioTrack {
  /** Unique identifier for the track */
  id: string;
  /** Path or URL to the audio file */
  source: string;
  /** Start time in the output video (seconds) */
  startAt?: number;
  /** Trim start time in the audio file (seconds) */
  trimStart?: number;
  /** Trim end time in the audio file (seconds) */
  trimEnd?: number;
  /** Volume level (0-1, default 1) */
  volume?: number;
  /** Fade in duration in seconds */
  fadeIn?: number;
  /** Fade out duration in seconds */
  fadeOut?: number;
  /** Whether to loop the audio */
  loop?: boolean;
}

// ============================================================================
// Subtitle Types
// ============================================================================

/** Single subtitle entry */
export interface SubtitleEntry {
  /** Unique identifier */
  id: string;
  /** Start time in seconds */
  startTime: number;
  /** End time in seconds */
  endTime: number;
  /** Subtitle text content */
  text: string;
}

/** Subtitle styling options */
export interface SubtitleStyle {
  /** Font family */
  fontFamily?: string;
  /** Font size in pixels */
  fontSize?: number;
  /** Font color (hex or rgba) */
  fontColor?: string;
  /** Background color (hex or rgba) */
  backgroundColor?: string;
  /** Background padding in pixels */
  backgroundPadding?: number;
  /** Background border radius */
  backgroundRadius?: number;
  /** Font weight */
  fontWeight?: "normal" | "bold" | "bolder";
  /** Text stroke color */
  strokeColor?: string;
  /** Text stroke width */
  strokeWidth?: number;
  /** Vertical position (0-1, 0 = top, 1 = bottom) */
  positionY?: number;
  /** Horizontal alignment */
  align?: "left" | "center" | "right";
  /** Text transform */
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  /** Animation style for word-by-word */
  animation?: SubtitleAnimation;
}

/** Subtitle animation types (TikTok-style) */
export type SubtitleAnimation =
  | "none"
  | "fade"
  | "pop"
  | "typewriter"
  | "highlight"
  | "bounce";

/** Full subtitle configuration */
export interface SubtitleConfig {
  /** Array of subtitle entries */
  entries: SubtitleEntry[];
  /** Styling options */
  style: SubtitleStyle;
  /** Whether to show word-by-word (requires word-level timestamps) */
  wordByWord?: boolean;
}

// ============================================================================
// Transition Types
// ============================================================================

/** Available transition effects */
export type TransitionType =
  // Basic
  | "none"
  | "fade"
  | "crossfade"
  // Directional
  | "slideLeft"
  | "slideRight"
  | "slideUp"
  | "slideDown"
  // Zoom
  | "zoomIn"
  | "zoomOut"
  // Wipe
  | "wipeLeft"
  | "wipeRight"
  | "wipeUp"
  | "wipeDown"
  // Creative
  | "blur"
  | "pixelize"
  | "rotate"
  | "flip"
  // Short-form popular
  | "glitch"
  | "flash"
  | "shake";

/** Transition configuration */
export interface Transition {
  /** Type of transition effect */
  type: TransitionType;
  /** Duration of the transition in seconds */
  duration: number;
  /** Easing function */
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut";
}

// ============================================================================
// Cut/Trim Types
// ============================================================================

/** Defines a segment to keep or remove */
export interface CutSegment {
  /** Start time in seconds */
  startTime: number;
  /** End time in seconds */
  endTime: number;
  /** Whether to keep or remove this segment */
  action: "keep" | "remove";
}

/** Cut operation configuration */
export interface CutConfig {
  /** Source video clip */
  source: VideoClip;
  /** Segments to process */
  segments: CutSegment[];
}

// ============================================================================
// Pipeline Types
// ============================================================================

/** Complete pipeline configuration */
export interface PipelineConfig {
  /** Video clips to concatenate (in order) */
  clips: VideoClip[];
  /** Transitions between clips (length should be clips.length - 1) */
  transitions?: Transition[];
  /** Default transition to use if not specified */
  defaultTransition?: Transition;
  /** Audio tracks to overlay */
  audioTracks?: AudioTrack[];
  /** Subtitle configuration */
  subtitles?: SubtitleConfig;
  /** Output configuration */
  output: OutputConfig;
}

/** Output file configuration */
export interface OutputConfig {
  /** Output file path */
  path: string;
  /** Video format */
  format?: VideoFormat;
  /** Aspect ratio */
  aspectRatio?: AspectRatio;
  /** Resolution */
  resolution?: Resolution;
  /** Frame rate */
  fps?: number;
  /** Video bitrate (e.g., '5M' for 5 Mbps) */
  videoBitrate?: string;
  /** Audio bitrate (e.g., '192k') */
  audioBitrate?: string;
  /** Quality preset */
  quality?: "draft" | "normal" | "high" | "best";
}

// ============================================================================
// Result Types
// ============================================================================

/** Result of a video editing operation */
export interface EditResult {
  /** Whether the operation succeeded */
  success: boolean;
  /** Output file path */
  outputPath?: string;
  /** Duration of output video in seconds */
  duration?: number;
  /** File size in bytes */
  fileSize?: number;
  /** Processing time in milliseconds */
  processingTime?: number;
  /** Error message if failed */
  error?: string;
}

/** Progress callback for long operations */
export interface ProgressInfo {
  /** Current stage of processing */
  stage: "preparing" | "processing" | "encoding" | "finalizing";
  /** Progress percentage (0-100) */
  percent: number;
  /** Current frame being processed */
  frame?: number;
  /** Total frames */
  totalFrames?: number;
  /** Estimated time remaining in seconds */
  eta?: number;
}

export type ProgressCallback = (progress: ProgressInfo) => void;

// ============================================================================
// SRT Parser Types
// ============================================================================

/** Raw SRT cue from parser */
export interface SrtCue {
  /** Cue index (1-based) */
  index: number;
  /** Start time in seconds */
  startTime: number;
  /** End time in seconds */
  endTime: number;
  /** Cue text (may contain multiple lines) */
  text: string;
}

/** Word-level timestamp for TikTok-style captions */
export interface WordTimestamp {
  /** The word */
  word: string;
  /** Start time in seconds */
  startTime: number;
  /** End time in seconds */
  endTime: number;
}
