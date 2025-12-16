/**
 * Audio Module
 * Audio track management, mixing, and FFmpeg filter generation
 */

import type { AudioTrack, VideoClip } from "./types";
import { DEFAULTS } from "./config";

// ============================================================================
// Audio Track Management
// ============================================================================

/**
 * Create an audio track configuration
 */
export function createAudioTrack(options: {
  id?: string;
  source: string;
  startAt?: number;
  trimStart?: number;
  trimEnd?: number;
  volume?: number;
  fadeIn?: number;
  fadeOut?: number;
  loop?: boolean;
}): AudioTrack {
  return {
    id: options.id || `audio-${Date.now()}`,
    source: options.source,
    startAt: options.startAt ?? 0,
    trimStart: options.trimStart,
    trimEnd: options.trimEnd,
    volume: options.volume ?? DEFAULTS.musicVolume,
    fadeIn: options.fadeIn ?? DEFAULTS.audioFadeDuration,
    fadeOut: options.fadeOut ?? DEFAULTS.audioFadeDuration,
    loop: options.loop ?? false,
  };
}

/**
 * Create a background music track with sensible defaults
 */
export function createBackgroundMusic(
  source: string,
  options?: {
    volume?: number;
    fadeIn?: number;
    fadeOut?: number;
    loop?: boolean;
  }
): AudioTrack {
  return createAudioTrack({
    id: "background-music",
    source,
    startAt: 0,
    volume: options?.volume ?? 0.3, // Background music should be quieter
    fadeIn: options?.fadeIn ?? 2.0, // Longer fade in for music
    fadeOut: options?.fadeOut ?? 3.0, // Longer fade out
    loop: options?.loop ?? true, // Usually want music to loop
  });
}

/**
 * Create a voiceover track
 */
export function createVoiceover(
  source: string,
  options?: {
    startAt?: number;
    volume?: number;
    trimStart?: number;
    trimEnd?: number;
  }
): AudioTrack {
  return createAudioTrack({
    id: "voiceover",
    source,
    startAt: options?.startAt ?? 0,
    trimStart: options?.trimStart,
    trimEnd: options?.trimEnd,
    volume: options?.volume ?? 1.0, // Voiceover at full volume
    fadeIn: 0.1, // Quick fade to avoid pops
    fadeOut: 0.1,
    loop: false,
  });
}

/**
 * Create a sound effect track
 */
export function createSoundEffect(
  source: string,
  startAt: number,
  options?: {
    volume?: number;
    id?: string;
  }
): AudioTrack {
  return createAudioTrack({
    id: options?.id || `sfx-${Date.now()}`,
    source,
    startAt,
    volume: options?.volume ?? 0.8,
    fadeIn: 0,
    fadeOut: 0,
    loop: false,
  });
}

// ============================================================================
// Audio Mixing Utilities
// ============================================================================

/**
 * Calculate the duration needed for background music
 */
export function calculateRequiredMusicDuration(
  clips: VideoClip[],
  transitionOverlap: number = 0
): number {
  const totalClipDuration = clips.reduce((sum, clip) => {
    const clipDuration =
      clip.duration || (clip.endTime ?? 0) - (clip.startTime ?? 0);
    return sum + clipDuration;
  }, 0);

  return totalClipDuration - transitionOverlap;
}

/**
 * Adjust audio track to fit video duration
 */
export function fitAudioToVideo(
  track: AudioTrack,
  videoDuration: number
): AudioTrack {
  const adjusted = { ...track };

  // If audio needs to end before video ends, add fadeout
  if (track.trimEnd && track.trimEnd < videoDuration) {
    adjusted.fadeOut = Math.max(track.fadeOut ?? 0, 1.0);
  }

  return adjusted;
}

/**
 * Calculate volume ducking when voiceover is present
 * Returns an array of time ranges where music should be ducked
 */
export interface DuckingRange {
  startTime: number;
  endTime: number;
  targetVolume: number;
}

export function calculateDuckingRanges(
  voiceoverTrack: AudioTrack,
  voiceoverDuration: number,
  duckAmount: number = 0.3 // Duck to 30% volume
): DuckingRange[] {
  const startTime = voiceoverTrack.startAt ?? 0;
  const trimStart = voiceoverTrack.trimStart ?? 0;
  const trimEnd = voiceoverTrack.trimEnd ?? voiceoverDuration;
  const actualDuration = trimEnd - trimStart;

  return [
    {
      startTime: startTime,
      endTime: startTime + actualDuration,
      targetVolume: duckAmount,
    },
  ];
}

// ============================================================================
// FFmpeg Filter Generation
// ============================================================================

/**
 * Generate FFmpeg volume filter
 */
export function generateVolumeFilter(
  inputLabel: string,
  volume: number,
  outputLabel: string
): string {
  return `[${inputLabel}]volume=${volume}[${outputLabel}]`;
}

/**
 * Generate FFmpeg fade filter for audio
 */
export function generateAudioFadeFilter(
  inputLabel: string,
  fadeIn: number,
  fadeOut: number,
  duration: number,
  outputLabel: string
): string {
  const filters: string[] = [];

  if (fadeIn > 0) {
    filters.push(`afade=t=in:st=0:d=${fadeIn}`);
  }

  if (fadeOut > 0) {
    const fadeOutStart = Math.max(0, duration - fadeOut);
    filters.push(`afade=t=out:st=${fadeOutStart}:d=${fadeOut}`);
  }

  if (filters.length === 0) {
    return `[${inputLabel}]acopy[${outputLabel}]`;
  }

  return `[${inputLabel}]${filters.join(",")}[${outputLabel}]`;
}

/**
 * Generate FFmpeg atrim filter for audio trimming
 */
export function generateAudioTrimFilter(
  inputLabel: string,
  startTime: number,
  endTime: number,
  outputLabel: string
): string {
  return `[${inputLabel}]atrim=start=${startTime}:end=${endTime},asetpts=PTS-STARTPTS[${outputLabel}]`;
}

/**
 * Generate FFmpeg adelay filter for positioning audio in timeline
 */
export function generateAudioDelayFilter(
  inputLabel: string,
  delayMs: number,
  outputLabel: string
): string {
  if (delayMs <= 0) {
    return `[${inputLabel}]acopy[${outputLabel}]`;
  }
  // Delay both channels (stereo)
  return `[${inputLabel}]adelay=${delayMs}|${delayMs}[${outputLabel}]`;
}

/**
 * Generate FFmpeg aloop filter for looping audio
 */
export function generateAudioLoopFilter(
  inputLabel: string,
  loops: number,
  outputLabel: string
): string {
  // -1 for infinite, but we'll calculate based on video duration
  return `[${inputLabel}]aloop=loop=${loops}:size=2e+09[${outputLabel}]`;
}

/**
 * Generate complete audio processing chain for a track
 */
export function generateAudioTrackFilter(
  track: AudioTrack,
  inputIndex: number,
  videoDuration: number,
  outputLabel: string
): string {
  const filters: string[] = [];
  let currentLabel = `${inputIndex}:a`;
  let stepIndex = 0;

  const nextLabel = () => {
    stepIndex++;
    return `a_${inputIndex}_${stepIndex}`;
  };

  // 1. Trim if needed
  if (track.trimStart !== undefined || track.trimEnd !== undefined) {
    const start = track.trimStart ?? 0;
    const end = track.trimEnd ?? 999999;
    const label = nextLabel();
    filters.push(generateAudioTrimFilter(currentLabel, start, end, label));
    currentLabel = label;
  }

  // 2. Loop if needed (must be before positioning)
  if (track.loop) {
    const label = nextLabel();
    // Calculate loops needed to cover video duration
    const estimatedDuration = (track.trimEnd ?? 300) - (track.trimStart ?? 0);
    const loopsNeeded = Math.ceil(videoDuration / estimatedDuration) + 1;
    filters.push(generateAudioLoopFilter(currentLabel, loopsNeeded, label));
    currentLabel = label;
  }

  // 3. Volume adjustment
  if (track.volume !== undefined && track.volume !== 1) {
    const label = nextLabel();
    filters.push(generateVolumeFilter(currentLabel, track.volume, label));
    currentLabel = label;
  }

  // 4. Delay/position in timeline
  if (track.startAt && track.startAt > 0) {
    const label = nextLabel();
    filters.push(
      generateAudioDelayFilter(currentLabel, track.startAt * 1000, label)
    );
    currentLabel = label;
  }

  // 5. Fade in/out
  if (
    (track.fadeIn && track.fadeIn > 0) ||
    (track.fadeOut && track.fadeOut > 0)
  ) {
    const label = nextLabel();
    filters.push(
      generateAudioFadeFilter(
        currentLabel,
        track.fadeIn ?? 0,
        track.fadeOut ?? 0,
        videoDuration,
        label
      )
    );
    currentLabel = label;
  }

  // Final: trim to video duration and output
  filters.push(`[${currentLabel}]atrim=0:${videoDuration}[${outputLabel}]`);

  return filters.join("; ");
}

/**
 * Generate amix filter to combine multiple audio tracks
 */
export function generateAudioMixFilter(
  inputLabels: string[],
  outputLabel: string,
  normalize: boolean = false
): string {
  if (inputLabels.length === 0) {
    return "";
  }

  if (inputLabels.length === 1) {
    return `[${inputLabels[0]}]acopy[${outputLabel}]`;
  }

  const inputs = inputLabels.map((l) => `[${l}]`).join("");
  const normalizeFlag = normalize ? 1 : 0;

  return `${inputs}amix=inputs=${inputLabels.length}:duration=longest:normalize=${normalizeFlag}[${outputLabel}]`;
}

/**
 * Generate ducking filter (lower music volume when voiceover plays)
 */
export function generateDuckingFilter(
  musicLabel: string,
  voiceLabel: string,
  duckingRanges: DuckingRange[],
  outputLabel: string
): string {
  // Use sidechaincompress for automatic ducking
  return (
    `[${musicLabel}][${voiceLabel}]sidechaincompress=` +
    `threshold=0.02:ratio=6:attack=200:release=1000[${outputLabel}]`
  );
}

// ============================================================================
// Audio Analysis Helpers
// ============================================================================

/**
 * Estimate audio duration from track config
 * Note: Actual duration requires ffprobe
 */
export function estimateTrackDuration(track: AudioTrack): number | null {
  if (track.trimStart !== undefined && track.trimEnd !== undefined) {
    return track.trimEnd - track.trimStart;
  }
  // Can't estimate without knowing source duration
  return null;
}

/**
 * Check if tracks will have audio conflicts
 */
export function detectAudioConflicts(tracks: AudioTrack[]): {
  hasConflict: boolean;
  message?: string;
} {
  // Check for multiple voiceovers
  const voiceovers = tracks.filter((t) => t.id?.includes("voiceover"));
  if (voiceovers.length > 1) {
    return {
      hasConflict: true,
      message: "Multiple voiceover tracks detected. Consider merging them.",
    };
  }

  // Check for overlapping sound effects at same time
  const sfx = tracks.filter((t) => t.id?.includes("sfx"));
  for (let i = 0; i < sfx.length; i++) {
    for (let j = i + 1; j < sfx.length; j++) {
      if (sfx[i].startAt === sfx[j].startAt) {
        return {
          hasConflict: true,
          message: `Sound effects "${sfx[i].id}" and "${sfx[j].id}" start at the same time.`,
        };
      }
    }
  }

  return { hasConflict: false };
}

// ============================================================================
// Volume Helpers
// ============================================================================

/**
 * Convert decibels to linear volume
 */
export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Convert linear volume to decibels
 */
export function linearToDb(linear: number): number {
  return 20 * Math.log10(linear);
}

/**
 * Normalize volume values to 0-1 range
 */
export function normalizeVolume(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}
