/**
 * Cuts Module
 * Video trimming, cutting, and segment extraction utilities
 */

import type { VideoClip, CutSegment, CutConfig } from "./types";

// ============================================================================
// Video Clip Creation
// ============================================================================

/**
 * Create a video clip configuration
 */
export function createVideoClip(options: {
  id?: string;
  source: string;
  startTime?: number;
  endTime?: number;
  duration?: number;
  volume?: number;
  muted?: boolean;
}): VideoClip {
  return {
    id:
      options.id ||
      `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    source: options.source,
    startTime: options.startTime,
    endTime: options.endTime,
    duration: options.duration,
    volume: options.volume ?? 1.0,
    muted: options.muted ?? false,
  };
}

/**
 * Create a trimmed clip from a source video
 */
export function trimClip(
  source: string,
  startTime: number,
  endTime: number,
  options?: {
    id?: string;
    volume?: number;
    muted?: boolean;
  }
): VideoClip {
  return createVideoClip({
    id: options?.id,
    source,
    startTime,
    endTime,
    duration: endTime - startTime,
    volume: options?.volume,
    muted: options?.muted,
  });
}

/**
 * Create multiple clips from a single source with multiple trim points
 */
export function splitIntoClips(
  source: string,
  timestamps: Array<{ start: number; end: number }>,
  options?: {
    volume?: number;
    muted?: boolean;
  }
): VideoClip[] {
  return timestamps.map((ts, index) =>
    trimClip(source, ts.start, ts.end, {
      id: `clip-${index + 1}`,
      volume: options?.volume,
      muted: options?.muted,
    })
  );
}

// ============================================================================
// Cut Operations
// ============================================================================

/**
 * Define segments to keep from a video
 */
export function createKeepSegments(
  source: string,
  keepRanges: Array<{ start: number; end: number }>
): CutConfig {
  const segments: CutSegment[] = keepRanges.map((range) => ({
    startTime: range.start,
    endTime: range.end,
    action: "keep",
  }));

  return {
    source: createVideoClip({ source }),
    segments,
  };
}

/**
 * Define segments to remove from a video
 */
export function createRemoveSegments(
  source: string,
  removeRanges: Array<{ start: number; end: number }>,
  totalDuration: number
): CutConfig {
  // Sort remove ranges by start time
  const sorted = [...removeRanges].sort((a, b) => a.start - b.start);

  // Convert remove segments to keep segments (inverse)
  const keepSegments: CutSegment[] = [];
  let currentTime = 0;

  for (const range of sorted) {
    if (currentTime < range.start) {
      keepSegments.push({
        startTime: currentTime,
        endTime: range.start,
        action: "keep",
      });
    }
    currentTime = range.end;
  }

  // Add final segment if there's content after last removal
  if (currentTime < totalDuration) {
    keepSegments.push({
      startTime: currentTime,
      endTime: totalDuration,
      action: "keep",
    });
  }

  return {
    source: createVideoClip({ source }),
    segments: keepSegments,
  };
}

/**
 * Convert cut config to array of video clips
 */
export function cutConfigToClips(config: CutConfig): VideoClip[] {
  const keepSegments = config.segments.filter((s) => s.action === "keep");

  return keepSegments.map((segment, index) =>
    createVideoClip({
      id: `${config.source.id}-segment-${index + 1}`,
      source: config.source.source,
      startTime: segment.startTime,
      endTime: segment.endTime,
      duration: segment.endTime - segment.startTime,
      volume: config.source.volume,
      muted: config.source.muted,
    })
  );
}

// ============================================================================
// Clip Manipulation
// ============================================================================

/**
 * Extend a clip's duration (adjust end time)
 */
export function extendClip(
  clip: VideoClip,
  additionalSeconds: number
): VideoClip {
  const currentEnd =
    clip.endTime ?? (clip.startTime ?? 0) + (clip.duration ?? 0);
  return {
    ...clip,
    endTime: currentEnd + additionalSeconds,
    duration: (clip.duration ?? 0) + additionalSeconds,
  };
}

/**
 * Shorten a clip's duration (adjust end time)
 */
export function shortenClip(
  clip: VideoClip,
  reduceBySeconds: number
): VideoClip {
  const currentDuration = clip.duration ?? 0;
  const newDuration = Math.max(0.1, currentDuration - reduceBySeconds);

  return {
    ...clip,
    endTime: (clip.startTime ?? 0) + newDuration,
    duration: newDuration,
  };
}

/**
 * Shift clip's trim window (move both start and end by same amount)
 */
export function shiftClip(clip: VideoClip, offsetSeconds: number): VideoClip {
  const newStart = Math.max(0, (clip.startTime ?? 0) + offsetSeconds);
  const duration = clip.duration ?? 0;

  return {
    ...clip,
    startTime: newStart,
    endTime: newStart + duration,
  };
}

/**
 * Split a clip at a specific timestamp
 */
export function splitClipAt(
  clip: VideoClip,
  splitTime: number
): { before: VideoClip; after: VideoClip } {
  const start = clip.startTime ?? 0;
  const end = clip.endTime ?? start + (clip.duration ?? 0);

  if (splitTime <= start || splitTime >= end) {
    throw new Error(
      `Split time ${splitTime} is outside clip range [${start}, ${end}]`
    );
  }

  const before = createVideoClip({
    id: `${clip.id}-a`,
    source: clip.source,
    startTime: start,
    endTime: splitTime,
    duration: splitTime - start,
    volume: clip.volume,
    muted: clip.muted,
  });

  const after = createVideoClip({
    id: `${clip.id}-b`,
    source: clip.source,
    startTime: splitTime,
    endTime: end,
    duration: end - splitTime,
    volume: clip.volume,
    muted: clip.muted,
  });

  return { before, after };
}

// ============================================================================
// Clip Validation
// ============================================================================

/**
 * Calculate effective duration of a clip
 */
export function getClipDuration(clip: VideoClip): number {
  if (clip.duration !== undefined) {
    return clip.duration;
  }

  if (clip.startTime !== undefined && clip.endTime !== undefined) {
    return clip.endTime - clip.startTime;
  }

  // Unknown duration
  return 0;
}

/**
 * Validate clip timing
 */
export function validateClip(clip: VideoClip): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (clip.startTime !== undefined && clip.startTime < 0) {
    errors.push("Start time cannot be negative");
  }

  if (clip.endTime !== undefined && clip.startTime !== undefined) {
    if (clip.endTime <= clip.startTime) {
      errors.push("End time must be greater than start time");
    }
  }

  if (clip.duration !== undefined && clip.duration <= 0) {
    errors.push("Duration must be positive");
  }

  if (clip.volume !== undefined && (clip.volume < 0 || clip.volume > 2)) {
    errors.push("Volume should be between 0 and 2");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate an array of clips
 */
export function validateClips(clips: VideoClip[]): {
  valid: boolean;
  errors: Array<{ clipId: string; errors: string[] }>;
} {
  const allErrors: Array<{ clipId: string; errors: string[] }> = [];

  for (const clip of clips) {
    const result = validateClip(clip);
    if (!result.valid) {
      allErrors.push({
        clipId: clip.id,
        errors: result.errors,
      });
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

// ============================================================================
// FFmpeg Filter Generation
// ============================================================================

/**
 * Generate FFmpeg trim filter for video
 */
export function generateVideoTrimFilter(
  inputLabel: string,
  startTime: number,
  endTime: number,
  outputLabel: string
): string {
  return (
    `[${inputLabel}]trim=start=${startTime}:end=${endTime},` +
    `setpts=PTS-STARTPTS[${outputLabel}]`
  );
}

/**
 * Generate FFmpeg trim filter for audio
 */
export function generateAudioTrimFilter(
  inputLabel: string,
  startTime: number,
  endTime: number,
  outputLabel: string
): string {
  return (
    `[${inputLabel}]atrim=start=${startTime}:end=${endTime},` +
    `asetpts=PTS-STARTPTS[${outputLabel}]`
  );
}

/**
 * Generate FFmpeg filter for clip volume adjustment
 */
export function generateClipVolumeFilter(
  inputLabel: string,
  volume: number,
  outputLabel: string
): string {
  if (volume === 1) {
    return `[${inputLabel}]acopy[${outputLabel}]`;
  }
  return `[${inputLabel}]volume=${volume}[${outputLabel}]`;
}

/**
 * Generate complete clip processing filter
 */
export function generateClipFilter(
  clip: VideoClip,
  inputIndex: number
): {
  videoFilter: string;
  audioFilter: string;
  videoLabel: string;
  audioLabel: string;
} {
  const videoLabel = `v${inputIndex}`;
  const audioLabel = `a${inputIndex}`;

  let videoFilter = "";
  let audioFilter = "";

  const hasTrims = clip.startTime !== undefined && clip.endTime !== undefined;

  if (hasTrims) {
    videoFilter = generateVideoTrimFilter(
      `${inputIndex}:v`,
      clip.startTime!,
      clip.endTime!,
      videoLabel
    );
    audioFilter = generateAudioTrimFilter(
      `${inputIndex}:a`,
      clip.startTime!,
      clip.endTime!,
      clip.muted ? `${audioLabel}_pre` : audioLabel
    );
  } else {
    videoFilter = `[${inputIndex}:v]copy[${videoLabel}]`;
    audioFilter = `[${inputIndex}:a]acopy[${clip.muted ? `${audioLabel}_pre` : audioLabel}]`;
  }

  // Handle muting
  if (clip.muted) {
    audioFilter += `; [${audioLabel}_pre]volume=0[${audioLabel}]`;
  } else if (clip.volume !== undefined && clip.volume !== 1) {
    const preLabel = hasTrims ? audioLabel : `${audioLabel}_pre`;
    if (!hasTrims) {
      audioFilter = `[${inputIndex}:a]acopy[${preLabel}]`;
    }
    audioFilter += `; [${preLabel}]volume=${clip.volume}[${audioLabel}]`;
  }

  return { videoFilter, audioFilter, videoLabel, audioLabel };
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Create clips from a list of sources with optional uniform trimming
 */
export function batchCreateClips(
  sources: string[],
  options?: {
    startTime?: number;
    duration?: number;
    volume?: number;
    muted?: boolean;
  }
): VideoClip[] {
  return sources.map((source, index) =>
    createVideoClip({
      id: `clip-${index + 1}`,
      source,
      startTime: options?.startTime,
      endTime:
        options?.startTime !== undefined && options?.duration !== undefined
          ? options.startTime + options.duration
          : undefined,
      duration: options?.duration,
      volume: options?.volume,
      muted: options?.muted,
    })
  );
}

/**
 * Calculate total duration of clips
 */
export function calculateTotalDuration(clips: VideoClip[]): number {
  return clips.reduce((total, clip) => total + getClipDuration(clip), 0);
}

/**
 * Reorder clips by index
 */
export function reorderClips(
  clips: VideoClip[],
  newOrder: number[]
): VideoClip[] {
  if (newOrder.length !== clips.length) {
    throw new Error("New order array must have same length as clips array");
  }

  return newOrder.map((index) => {
    if (index < 0 || index >= clips.length) {
      throw new Error(`Invalid index ${index} in new order`);
    }
    return clips[index];
  });
}

/**
 * Remove clip at index
 */
export function removeClipAt(clips: VideoClip[], index: number): VideoClip[] {
  if (index < 0 || index >= clips.length) {
    throw new Error(`Invalid index ${index}`);
  }
  return [...clips.slice(0, index), ...clips.slice(index + 1)];
}

/**
 * Insert clip at index
 */
export function insertClipAt(
  clips: VideoClip[],
  clip: VideoClip,
  index: number
): VideoClip[] {
  if (index < 0 || index > clips.length) {
    throw new Error(`Invalid index ${index}`);
  }
  return [...clips.slice(0, index), clip, ...clips.slice(index)];
}
