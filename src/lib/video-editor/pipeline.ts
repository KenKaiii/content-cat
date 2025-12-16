/**
 * Video Editor Pipeline
 * Main orchestrator that combines all modules into a complete video editing workflow
 */

import { spawn } from "child_process";
import { promises as fs } from "fs";
import * as path from "path";

import type {
  VideoClip,
  AudioTrack,
  Transition,
  SubtitleConfig,
  OutputConfig,
  PipelineConfig,
  EditResult,
  ProgressCallback,
  ProgressInfo,
  AspectRatio,
  Resolution,
} from "./types";
import {
  DEFAULTS,
  getDimensions,
  getOutputConfigForPlatform,
  Platform,
  SUBTITLE_PRESETS,
} from "./config";
import { createTransition, autoAdjustTransitions } from "./transitions";
import { generateAudioTrackFilter, generateAudioMixFilter } from "./audio";
import { getClipDuration, validateClips } from "./cuts";
import { createSubtitleConfig, parseSubtitleFile } from "./subtitles";

// ============================================================================
// Pipeline Builder
// ============================================================================

/**
 * Fluent builder for constructing video editing pipelines
 */
export class VideoPipelineBuilder {
  private clips: VideoClip[] = [];
  private transitions: Transition[] = [];
  private audioTracks: AudioTrack[] = [];
  private subtitleConfig?: SubtitleConfig;
  private outputConfig: Partial<OutputConfig> = {};

  /**
   * Add a video clip to the pipeline
   */
  addClip(clip: VideoClip): this {
    this.clips.push(clip);
    return this;
  }

  /**
   * Add multiple clips at once
   */
  addClips(clips: VideoClip[]): this {
    this.clips.push(...clips);
    return this;
  }

  /**
   * Add clips from file paths
   */
  addClipsFromPaths(paths: string[]): this {
    paths.forEach((source, index) => {
      this.clips.push({
        id: `clip-${index + 1}`,
        source,
      });
    });
    return this;
  }

  /**
   * Set transition between specific clips
   */
  setTransition(index: number, transition: Transition): this {
    this.transitions[index] = transition;
    return this;
  }

  /**
   * Set all transitions to the same type
   */
  setAllTransitions(transition: Transition): this {
    const count = Math.max(0, this.clips.length - 1);
    this.transitions = Array(count).fill(transition);
    return this;
  }

  /**
   * Set transitions from an array
   */
  setTransitions(transitions: Transition[]): this {
    this.transitions = transitions;
    return this;
  }

  /**
   * Add an audio track
   */
  addAudioTrack(track: AudioTrack): this {
    this.audioTracks.push(track);
    return this;
  }

  /**
   * Add background music
   */
  addBackgroundMusic(
    source: string,
    options?: { volume?: number; fadeIn?: number; fadeOut?: number }
  ): this {
    this.audioTracks.push({
      id: "background-music",
      source,
      volume: options?.volume ?? 0.3,
      fadeIn: options?.fadeIn ?? 2.0,
      fadeOut: options?.fadeOut ?? 3.0,
      loop: true,
    });
    return this;
  }

  /**
   * Set subtitles from SRT content
   */
  setSubtitlesFromSrt(
    srtContent: string,
    preset?: keyof typeof SUBTITLE_PRESETS
  ): this {
    const entries = parseSubtitleFile(srtContent);
    this.subtitleConfig = createSubtitleConfig({
      entries,
      preset: preset ?? "tiktok",
    });
    return this;
  }

  /**
   * Set subtitle configuration directly
   */
  setSubtitles(config: SubtitleConfig): this {
    this.subtitleConfig = config;
    return this;
  }

  /**
   * Set output path
   */
  setOutput(outputPath: string): this {
    this.outputConfig.path = outputPath;
    return this;
  }

  /**
   * Set output format for a specific platform
   */
  setOutputForPlatform(platform: Platform, outputPath: string): this {
    this.outputConfig = getOutputConfigForPlatform(platform, outputPath);
    return this;
  }

  /**
   * Set aspect ratio
   */
  setAspectRatio(aspectRatio: AspectRatio): this {
    this.outputConfig.aspectRatio = aspectRatio;
    return this;
  }

  /**
   * Set resolution
   */
  setResolution(resolution: Resolution): this {
    this.outputConfig.resolution = resolution;
    return this;
  }

  /**
   * Set quality preset
   */
  setQuality(quality: OutputConfig["quality"]): this {
    this.outputConfig.quality = quality;
    return this;
  }

  /**
   * Build the pipeline configuration
   */
  build(): PipelineConfig {
    if (this.clips.length === 0) {
      throw new Error("At least one clip is required");
    }

    if (!this.outputConfig.path) {
      throw new Error("Output path is required");
    }

    // Fill in missing transitions
    while (this.transitions.length < this.clips.length - 1) {
      this.transitions.push(DEFAULTS.transition);
    }

    // Auto-adjust transition durations
    const clipDurations = this.clips.map(getClipDuration);
    const adjustedTransitions = autoAdjustTransitions(
      clipDurations,
      this.transitions
    );

    return {
      clips: this.clips,
      transitions: adjustedTransitions,
      audioTracks: this.audioTracks.length > 0 ? this.audioTracks : undefined,
      subtitles: this.subtitleConfig,
      output: {
        path: this.outputConfig.path,
        format: this.outputConfig.format ?? DEFAULTS.format,
        aspectRatio: this.outputConfig.aspectRatio ?? DEFAULTS.aspectRatio,
        resolution: this.outputConfig.resolution ?? DEFAULTS.resolution,
        fps: this.outputConfig.fps ?? DEFAULTS.fps,
        quality: this.outputConfig.quality ?? "high",
        videoBitrate: this.outputConfig.videoBitrate,
        audioBitrate: this.outputConfig.audioBitrate,
      },
    };
  }
}

/**
 * Create a new pipeline builder
 */
export function createPipeline(): VideoPipelineBuilder {
  return new VideoPipelineBuilder();
}

// ============================================================================
// FFmpeg Command Generation
// ============================================================================

/**
 * Generate complete FFmpeg command from pipeline config
 */
export function generatePipelineCommand(config: PipelineConfig): string[] {
  const { clips, transitions, audioTracks, subtitles, output } = config;

  const dims = getDimensions(
    output.aspectRatio ?? DEFAULTS.aspectRatio,
    output.resolution ?? DEFAULTS.resolution
  );

  const command: string[] = ["ffmpeg"];
  const filterParts: string[] = [];

  // Add video inputs
  clips.forEach((clip) => {
    command.push("-i", clip.source);
  });

  // Add audio inputs
  const audioInputStartIndex = clips.length;
  audioTracks?.forEach((track) => {
    command.push("-i", track.source);
  });

  // Calculate total video duration
  const clipDurations = clips.map(getClipDuration);
  const transitionOverlap =
    transitions?.reduce((sum, t) => sum + t.duration, 0) ?? 0;
  const totalDuration =
    clipDurations.reduce((sum, d) => sum + d, 0) - transitionOverlap;

  // Process video clips
  clips.forEach((clip, i) => {
    const hasTrims = clip.startTime !== undefined && clip.endTime !== undefined;

    let videoFilter = `[${i}:v]`;

    if (hasTrims) {
      videoFilter += `trim=start=${clip.startTime}:end=${clip.endTime},setpts=PTS-STARTPTS,`;
    }

    videoFilter +=
      `scale=${dims.width}:${dims.height}:force_original_aspect_ratio=decrease,` +
      `pad=${dims.width}:${dims.height}:(ow-iw)/2:(oh-ih)/2:black,` +
      `setsar=1,fps=${output.fps ?? 30},format=yuv420p[v${i}]`;

    filterParts.push(videoFilter);

    // Audio from video clips
    let audioFilter = `[${i}:a]`;

    if (hasTrims) {
      audioFilter += `atrim=start=${clip.startTime}:end=${clip.endTime},asetpts=PTS-STARTPTS,`;
    }

    if (clip.muted) {
      audioFilter += "volume=0,";
    } else if (clip.volume !== undefined && clip.volume !== 1) {
      audioFilter += `volume=${clip.volume},`;
    }

    audioFilter += `aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a${i}]`;
    filterParts.push(audioFilter);
  });

  // Concatenate or apply transitions
  if (clips.length === 1) {
    filterParts.push("[v0]copy[concatv]");
    filterParts.push("[a0]acopy[concata]");
  } else {
    // Video transitions
    let currentVideoLabel = "v0";
    let runningDuration = clipDurations[0];

    for (let i = 0; i < clips.length - 1; i++) {
      const transition = transitions?.[i] ?? createTransition("none");
      const nextVideoLabel = `v${i + 1}`;
      const isLast = i === clips.length - 2;
      const outLabel = isLast ? "concatv" : `xv${i}`;

      if (transition.type === "none" || transition.duration === 0) {
        filterParts.push(
          `[${currentVideoLabel}][${nextVideoLabel}]concat=n=2:v=1:a=0[${outLabel}]`
        );
      } else {
        const offset = Math.max(0, runningDuration - transition.duration);
        const xfadeName =
          transition.type === "crossfade" ? "dissolve" : transition.type;

        filterParts.push(
          `[${currentVideoLabel}][${nextVideoLabel}]xfade=` +
            `transition=${xfadeName}:duration=${transition.duration}:offset=${offset}[${outLabel}]`
        );
      }

      currentVideoLabel = outLabel;
      runningDuration =
        runningDuration - transition.duration + clipDurations[i + 1];
    }

    // Audio transitions (acrossfade)
    let currentAudioLabel = "a0";

    for (let i = 0; i < clips.length - 1; i++) {
      const transition = transitions?.[i] ?? createTransition("none");
      const nextAudioLabel = `a${i + 1}`;
      const isLast = i === clips.length - 2;
      const outLabel = isLast ? "concata" : `xa${i}`;

      if (transition.duration === 0) {
        filterParts.push(
          `[${currentAudioLabel}][${nextAudioLabel}]concat=n=2:v=0:a=1[${outLabel}]`
        );
      } else {
        filterParts.push(
          `[${currentAudioLabel}][${nextAudioLabel}]acrossfade=d=${transition.duration}[${outLabel}]`
        );
      }

      currentAudioLabel = outLabel;
    }
  }

  // Process additional audio tracks
  const audioMixInputs: string[] = ["concata"];

  if (audioTracks && audioTracks.length > 0) {
    audioTracks.forEach((track, i) => {
      const inputIdx = audioInputStartIndex + i;
      const outputLabel = `music${i}`;

      filterParts.push(
        generateAudioTrackFilter(track, inputIdx, totalDuration, outputLabel)
      );
      audioMixInputs.push(outputLabel);
    });
  }

  // Mix all audio
  if (audioMixInputs.length > 1) {
    filterParts.push(generateAudioMixFilter(audioMixInputs, "mixeda"));
  } else {
    filterParts.push("[concata]acopy[mixeda]");
  }

  // Apply subtitles if present
  let finalVideoLabel = "concatv";

  if (subtitles && subtitles.entries.length > 0) {
    // For now, use simple drawtext - could be extended to use ASS
    const style = subtitles.style;
    const fontSize = style.fontSize ?? 48;
    const fontColor = (style.fontColor ?? "#FFFFFF").replace("#", "");

    // Generate subtitle filter for each entry
    // Note: This is a simplified version - production would use ASS format
    const subtitleFilters = subtitles.entries.map((entry) => {
      const escapedText = entry.text
        .replace(/'/g, "'\\''")
        .replace(/:/g, "\\:")
        .replace(/\n/g, " ");

      return (
        `drawtext=text='${escapedText}':` +
        `fontsize=${fontSize}:fontcolor=0x${fontColor}:` +
        `x=(w-text_w)/2:y=h*${style.positionY ?? 0.85}:` +
        `enable='between(t,${entry.startTime},${entry.endTime})'`
      );
    });

    if (subtitleFilters.length > 0) {
      filterParts.push(`[concatv]${subtitleFilters.join(",")}[subv]`);
      finalVideoLabel = "subv";
    }
  }

  // Build filter complex (use semicolons with newlines for proper FFmpeg parsing)
  command.push("-filter_complex", filterParts.join(";\n"));

  // Map outputs
  command.push("-map", `[${finalVideoLabel}]`);
  command.push("-map", "[mixeda]");

  // Output encoding settings
  command.push("-c:v", "libx264");
  command.push("-preset", "medium");

  const crfMap = { draft: "28", normal: "23", high: "20", best: "18" };
  command.push("-crf", crfMap[output.quality ?? "high"]);

  if (output.videoBitrate) {
    command.push("-b:v", output.videoBitrate);
  }

  command.push("-c:a", "aac");
  command.push("-b:a", output.audioBitrate ?? "192k");

  command.push("-movflags", "+faststart");
  command.push("-y");
  command.push(output.path);

  return command;
}

// ============================================================================
// Pipeline Execution
// ============================================================================

/**
 * Execute the video editing pipeline
 */
export async function executePipeline(
  config: PipelineConfig,
  onProgress?: ProgressCallback
): Promise<EditResult> {
  const startTime = Date.now();

  // Validate clips
  const validation = validateClips(config.clips);
  if (!validation.valid) {
    return {
      success: false,
      error: `Invalid clips: ${JSON.stringify(validation.errors)}`,
    };
  }

  // Ensure output directory exists
  const outputDir = path.dirname(config.output.path);
  await fs.mkdir(outputDir, { recursive: true });

  // Generate command
  const command = generatePipelineCommand(config);

  return new Promise((resolve) => {
    const ffmpeg = spawn(command[0], command.slice(1));

    let stderr = "";
    let lastProgress: ProgressInfo = {
      stage: "preparing",
      percent: 0,
    };

    ffmpeg.stderr.on("data", (data: Buffer) => {
      const output = data.toString();
      stderr += output;

      // Parse progress from FFmpeg output
      const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})/);
      if (timeMatch && onProgress) {
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const seconds = parseInt(timeMatch[3], 10);
        const currentTime = hours * 3600 + minutes * 60 + seconds;

        // Estimate total duration
        const clipDurations = config.clips.map(getClipDuration);
        const transOverlap =
          config.transitions?.reduce((sum, t) => sum + t.duration, 0) ?? 0;
        const totalDuration =
          clipDurations.reduce((sum, d) => sum + d, 0) - transOverlap;

        const percent = Math.min(
          99,
          Math.round((currentTime / totalDuration) * 100)
        );

        lastProgress = {
          stage: "processing",
          percent,
          eta: Math.round(
            (((100 - percent) / percent) * (Date.now() - startTime)) / 1000
          ),
        };

        onProgress(lastProgress);
      }
    });

    ffmpeg.on("close", async (code) => {
      const processingTime = Date.now() - startTime;

      if (code === 0) {
        // Get output file stats
        try {
          const stats = await fs.stat(config.output.path);

          if (onProgress) {
            onProgress({ stage: "finalizing", percent: 100 });
          }

          resolve({
            success: true,
            outputPath: config.output.path,
            fileSize: stats.size,
            processingTime,
          });
        } catch {
          resolve({
            success: true,
            outputPath: config.output.path,
            processingTime,
          });
        }
      } else {
        resolve({
          success: false,
          error: `FFmpeg exited with code ${code}: ${stderr.slice(-500)}`,
          processingTime,
        });
      }
    });

    ffmpeg.on("error", (err) => {
      resolve({
        success: false,
        error: `Failed to start FFmpeg: ${err.message}`,
        processingTime: Date.now() - startTime,
      });
    });
  });
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Quick function to concatenate videos for TikTok/Reels
 */
export async function createShortFormVideo(options: {
  clips: string[];
  outputPath: string;
  music?: { source: string; volume?: number };
  subtitlesSrt?: string;
  transitionStyle?: "none" | "fade" | "flash";
  onProgress?: ProgressCallback;
}): Promise<EditResult> {
  const builder = createPipeline()
    .addClipsFromPaths(options.clips)
    .setOutputForPlatform("tiktok", options.outputPath);

  // Set transitions
  if (options.transitionStyle === "none") {
    builder.setAllTransitions(createTransition("none"));
  } else if (options.transitionStyle === "flash") {
    builder.setAllTransitions(createTransition("flash", 0.15));
  } else {
    builder.setAllTransitions(createTransition("fade", 0.3));
  }

  // Add music if provided
  if (options.music) {
    builder.addBackgroundMusic(options.music.source, {
      volume: options.music.volume ?? 0.3,
    });
  }

  // Add subtitles if provided
  if (options.subtitlesSrt) {
    builder.setSubtitlesFromSrt(options.subtitlesSrt, "tiktok");
  }

  const config = builder.build();
  return executePipeline(config, options.onProgress);
}

/**
 * Simple video concatenation without effects
 */
export async function concatenateVideos(
  inputPaths: string[],
  outputPath: string,
  onProgress?: ProgressCallback
): Promise<EditResult> {
  const config = createPipeline()
    .addClipsFromPaths(inputPaths)
    .setAllTransitions(createTransition("none"))
    .setOutput(outputPath)
    .build();

  return executePipeline(config, onProgress);
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Check if FFmpeg is available
 */
export async function checkFFmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const process = spawn("ffmpeg", ["-version"]);

    process.on("close", (code) => {
      resolve(code === 0);
    });

    process.on("error", () => {
      resolve(false);
    });
  });
}

/**
 * Get FFmpeg version
 */
export async function getFFmpegVersion(): Promise<string | null> {
  return new Promise((resolve) => {
    const process = spawn("ffmpeg", ["-version"]);

    let output = "";

    process.stdout.on("data", (data: Buffer) => {
      output += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        const match = output.match(/ffmpeg version (\S+)/);
        resolve(match ? match[1] : null);
      } else {
        resolve(null);
      }
    });

    process.on("error", () => {
      resolve(null);
    });
  });
}
