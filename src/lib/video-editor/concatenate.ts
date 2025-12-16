/**
 * Concatenate Module
 * Video concatenation with or without transitions
 */

import type {
  VideoClip,
  Transition,
  OutputConfig,
  AspectRatio,
  Resolution,
} from "./types";
import { DEFAULTS, getDimensions } from "./config";
import { createTransition, TRANSITION_DEFINITIONS } from "./transitions";
import { getClipDuration } from "./cuts";

// ============================================================================
// Concatenation Configuration
// ============================================================================

export interface ConcatConfig {
  /** Video clips to concatenate */
  clips: VideoClip[];
  /** Transitions between clips (length = clips.length - 1) */
  transitions?: Transition[];
  /** Default transition to use when not specified */
  defaultTransition?: Transition;
  /** Output configuration */
  output: OutputConfig;
}

export interface ConcatResult {
  /** Generated FFmpeg filter complex string */
  filterComplex: string;
  /** Input file arguments */
  inputs: string[];
  /** Output arguments */
  outputArgs: string[];
  /** Estimated output duration */
  estimatedDuration: number;
  /** Video output label */
  videoOutputLabel: string;
  /** Audio output label */
  audioOutputLabel: string;
}

// ============================================================================
// Concatenation Logic
// ============================================================================

/**
 * Build concatenation configuration
 */
export function buildConcatConfig(
  clips: VideoClip[],
  options?: {
    transitions?: Transition[];
    defaultTransition?: Transition;
    output?: Partial<OutputConfig>;
  }
): ConcatConfig {
  // Fill in missing transitions with default
  const defaultTrans = options?.defaultTransition ?? DEFAULTS.transition;
  const numTransitions = Math.max(0, clips.length - 1);

  const transitions: Transition[] = [];
  for (let i = 0; i < numTransitions; i++) {
    transitions.push(options?.transitions?.[i] ?? defaultTrans);
  }

  return {
    clips,
    transitions,
    defaultTransition: defaultTrans,
    output: {
      path: options?.output?.path ?? "./output.mp4",
      format: options?.output?.format ?? DEFAULTS.format,
      aspectRatio: options?.output?.aspectRatio ?? DEFAULTS.aspectRatio,
      resolution: options?.output?.resolution ?? DEFAULTS.resolution,
      fps: options?.output?.fps ?? DEFAULTS.fps,
      quality: options?.output?.quality ?? "high",
      ...options?.output,
    },
  };
}

/**
 * Calculate total output duration accounting for transitions
 */
export function calculateOutputDuration(config: ConcatConfig): number {
  const clipDurations = config.clips.map(getClipDuration);
  const totalClipDuration = clipDurations.reduce((sum, d) => sum + d, 0);

  // Transitions overlap clips, reducing total duration
  const transitionOverlap =
    config.transitions?.reduce((sum, t) => sum + t.duration, 0) ?? 0;

  return totalClipDuration - transitionOverlap;
}

// ============================================================================
// FFmpeg Filter Generation
// ============================================================================

/**
 * Generate scale and format filter for consistent output
 */
export function generateScaleFilter(
  inputLabel: string,
  aspectRatio: AspectRatio,
  resolution: Resolution,
  outputLabel: string
): string {
  const dims = getDimensions(aspectRatio, resolution);

  // Scale to fit, then pad to exact dimensions (letterbox/pillarbox if needed)
  return (
    `[${inputLabel}]scale=${dims.width}:${dims.height}:` +
    `force_original_aspect_ratio=decrease,` +
    `pad=${dims.width}:${dims.height}:(ow-iw)/2:(oh-ih)/2:black,` +
    `setsar=1,fps=30,format=yuv420p[${outputLabel}]`
  );
}

/**
 * Generate simple concat filter (no transitions)
 */
export function generateSimpleConcatFilter(clipCount: number): {
  filter: string;
  videoLabel: string;
  audioLabel: string;
} {
  const videoInputs = Array.from(
    { length: clipCount },
    (_, i) => `[v${i}]`
  ).join("");
  const audioInputs = Array.from(
    { length: clipCount },
    (_, i) => `[a${i}]`
  ).join("");

  return {
    filter:
      `${videoInputs}concat=n=${clipCount}:v=1:a=0[outv]; ` +
      `${audioInputs}concat=n=${clipCount}:v=0:a=1[outa]`,
    videoLabel: "outv",
    audioLabel: "outa",
  };
}

/**
 * Generate xfade transition between two clips
 */
export function generateXfadeFilter(
  input1: string,
  input2: string,
  transition: Transition,
  offset: number,
  outputLabel: string
): string {
  const def = TRANSITION_DEFINITIONS[transition.type];

  if (
    !def.usesXfade ||
    transition.type === "none" ||
    transition.duration === 0
  ) {
    // Simple concat without transition
    return `[${input1}][${input2}]concat=n=2:v=1:a=0[${outputLabel}]`;
  }

  const xfadeName = def.xfadeName || "fade";

  return (
    `[${input1}][${input2}]xfade=` +
    `transition=${xfadeName}:` +
    `duration=${transition.duration}:` +
    `offset=${offset}[${outputLabel}]`
  );
}

/**
 * Generate audio crossfade between two clips
 */
export function generateAcrossfadeFilter(
  input1: string,
  input2: string,
  duration: number,
  outputLabel: string
): string {
  if (duration === 0) {
    return `[${input1}][${input2}]concat=n=2:v=0:a=1[${outputLabel}]`;
  }

  return (
    `[${input1}][${input2}]acrossfade=` +
    `d=${duration}:c1=tri:c2=tri[${outputLabel}]`
  );
}

/**
 * Generate complete filter complex for concatenation with transitions
 */
export function generateConcatFilterComplex(
  config: ConcatConfig
): ConcatResult {
  const clips = config.clips;
  const transitions = config.transitions || [];
  const output = config.output;

  if (clips.length === 0) {
    throw new Error("At least one clip is required");
  }

  const filterParts: string[] = [];
  const inputs: string[] = [];
  const dims = getDimensions(
    output.aspectRatio ?? DEFAULTS.aspectRatio,
    output.resolution ?? DEFAULTS.resolution
  );

  // Add inputs
  clips.forEach((clip) => {
    inputs.push("-i", clip.source);
  });

  // Step 1: Process each clip (trim, scale, format)
  clips.forEach((clip, i) => {
    const hasTrims = clip.startTime !== undefined && clip.endTime !== undefined;

    // Video processing
    let videoFilter = `[${i}:v]`;

    if (hasTrims) {
      videoFilter += `trim=start=${clip.startTime}:end=${clip.endTime},setpts=PTS-STARTPTS,`;
    }

    videoFilter +=
      `scale=${dims.width}:${dims.height}:force_original_aspect_ratio=decrease,` +
      `pad=${dims.width}:${dims.height}:(ow-iw)/2:(oh-ih)/2:black,` +
      `setsar=1,fps=${output.fps ?? 30},format=yuv420p[v${i}]`;

    filterParts.push(videoFilter);

    // Audio processing
    let audioFilter = `[${i}:a]`;

    if (hasTrims) {
      audioFilter += `atrim=start=${clip.startTime}:end=${clip.endTime},asetpts=PTS-STARTPTS,`;
    }

    if (clip.muted) {
      audioFilter += `volume=0,`;
    } else if (clip.volume !== undefined && clip.volume !== 1) {
      audioFilter += `volume=${clip.volume},`;
    }

    audioFilter += `aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a${i}]`;

    filterParts.push(audioFilter);
  });

  // Step 2: Apply transitions (video)
  if (clips.length === 1) {
    // Single clip, just copy
    filterParts.push("[v0]copy[outv]");
    filterParts.push("[a0]acopy[outa]");
  } else {
    // Multiple clips with transitions
    const clipDurations = clips.map(getClipDuration);
    let currentVideoLabel = "v0";
    let currentAudioLabel = "a0";
    let runningDuration = clipDurations[0];

    for (let i = 0; i < clips.length - 1; i++) {
      const transition = transitions[i] ?? createTransition("none");
      const nextVideoLabel = `v${i + 1}`;
      const nextAudioLabel = `a${i + 1}`;
      const isLast = i === clips.length - 2;
      const outVideoLabel = isLast ? "outv" : `xv${i}`;
      const outAudioLabel = isLast ? "outa" : `xa${i}`;

      // Calculate offset (where transition starts)
      const offset = runningDuration - transition.duration;

      // Video transition
      const videoXfade = generateXfadeFilter(
        currentVideoLabel,
        nextVideoLabel,
        transition,
        offset,
        outVideoLabel
      );
      filterParts.push(videoXfade);

      // Audio transition
      const audioXfade = generateAcrossfadeFilter(
        currentAudioLabel,
        nextAudioLabel,
        transition.duration,
        outAudioLabel
      );
      filterParts.push(audioXfade);

      // Update for next iteration
      currentVideoLabel = outVideoLabel;
      currentAudioLabel = outAudioLabel;
      runningDuration =
        runningDuration - transition.duration + clipDurations[i + 1];
    }
  }

  // Build output arguments
  const outputArgs: string[] = [];

  // Video codec
  outputArgs.push("-c:v", "libx264");
  outputArgs.push("-preset", "medium");
  outputArgs.push(
    "-crf",
    output.quality === "best" ? "18" : output.quality === "high" ? "20" : "23"
  );

  if (output.videoBitrate) {
    outputArgs.push("-b:v", output.videoBitrate);
  }

  // Audio codec
  outputArgs.push("-c:a", "aac");
  outputArgs.push("-b:a", output.audioBitrate ?? "192k");

  // Output format
  outputArgs.push("-movflags", "+faststart");
  outputArgs.push("-y"); // Overwrite output

  return {
    filterComplex: filterParts.join(";\n"),
    inputs,
    outputArgs,
    estimatedDuration: calculateOutputDuration(config),
    videoOutputLabel: "outv",
    audioOutputLabel: "outa",
  };
}

// ============================================================================
// Command Generation
// ============================================================================

/**
 * Generate complete FFmpeg command for concatenation
 */
export function generateConcatCommand(config: ConcatConfig): string[] {
  const result = generateConcatFilterComplex(config);

  const command = [
    "ffmpeg",
    ...result.inputs,
    "-filter_complex",
    result.filterComplex,
    "-map",
    `[${result.videoOutputLabel}]`,
    "-map",
    `[${result.audioOutputLabel}]`,
    ...result.outputArgs,
    config.output.path,
  ];

  return command;
}

/**
 * Generate FFmpeg command as string (for display/debugging)
 */
export function generateConcatCommandString(config: ConcatConfig): string {
  const command = generateConcatCommand(config);

  // Escape and quote arguments that need it
  return command
    .map((arg) => {
      if (arg.includes(" ") || arg.includes(";") || arg.includes("[")) {
        return `"${arg.replace(/"/g, '\\"')}"`;
      }
      return arg;
    })
    .join(" ");
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick concatenation without transitions
 */
export function simpleConcatConfig(
  sources: string[],
  outputPath: string,
  options?: {
    aspectRatio?: AspectRatio;
    resolution?: Resolution;
  }
): ConcatConfig {
  const clips: VideoClip[] = sources.map((source, i) => ({
    id: `clip-${i}`,
    source,
  }));

  return buildConcatConfig(clips, {
    transitions: sources.slice(1).map(() => createTransition("none")),
    output: {
      path: outputPath,
      aspectRatio: options?.aspectRatio,
      resolution: options?.resolution,
    },
  });
}

/**
 * Concatenation with uniform transitions
 */
export function uniformTransitionConfig(
  sources: string[],
  outputPath: string,
  transition: Transition,
  options?: {
    aspectRatio?: AspectRatio;
    resolution?: Resolution;
  }
): ConcatConfig {
  const clips: VideoClip[] = sources.map((source, i) => ({
    id: `clip-${i}`,
    source,
  }));

  return buildConcatConfig(clips, {
    defaultTransition: transition,
    output: {
      path: outputPath,
      aspectRatio: options?.aspectRatio,
      resolution: options?.resolution,
    },
  });
}

/**
 * Create config for TikTok/Reels style video
 */
export function shortFormConcatConfig(
  sources: string[],
  outputPath: string,
  options?: {
    transitionStyle?: "none" | "quick" | "flashy";
  }
): ConcatConfig {
  const style = options?.transitionStyle ?? "quick";

  let transition: Transition;
  switch (style) {
    case "none":
      transition = createTransition("none");
      break;
    case "flashy":
      transition = createTransition("flash", 0.15);
      break;
    case "quick":
    default:
      transition = createTransition("fade", 0.2);
      break;
  }

  const clips: VideoClip[] = sources.map((source, i) => ({
    id: `clip-${i}`,
    source,
  }));

  return buildConcatConfig(clips, {
    defaultTransition: transition,
    output: {
      path: outputPath,
      aspectRatio: "9:16",
      resolution: "1080p",
      fps: 30,
      quality: "high",
    },
  });
}
