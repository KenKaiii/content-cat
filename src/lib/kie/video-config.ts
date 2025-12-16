/**
 * Video Model Configuration
 * Maps UI controls to video model API parameters
 */

// Available video models
export type VideoModelId = "kling-2.6" | "wan-2.5";

export type VideoMode = "text-to-video" | "image-to-video";

// Common types for UI
export type AspectRatio = "1:1" | "16:9" | "9:16";
export type Duration = "5" | "10";
export type Resolution = "720p" | "1080p";

// Model capability definitions
export interface VideoModelConfig {
  id: VideoModelId;
  name: string;
  shortName: string;
  description: string;
  modes: VideoMode[];
  aspectRatios: AspectRatio[];
  durations: Duration[];
  resolutions?: Resolution[];
  supportsAudio: boolean;
  supportsPromptEnhancement: boolean;
  supportsNegativePrompt: boolean;
  maxPromptLength: number;
  maxImageSizeMB: number;
  creditsPerSecond: {
    "720p"?: number;
    "1080p"?: number;
    default?: number;
  };
}

// UI State for video generation
export interface VideoGenerationState {
  model: VideoModelId;
  mode: VideoMode;
  prompt: string;
  negativePrompt?: string;
  imageUrl?: string;
  aspectRatio: AspectRatio;
  duration: Duration;
  resolution?: Resolution;
  audioEnabled: boolean;
  enhanceEnabled: boolean;
  seed?: number;
}

// Model configurations
export const VIDEO_MODELS: Record<VideoModelId, VideoModelConfig> = {
  "kling-2.6": {
    id: "kling-2.6",
    name: "Kling 2.6",
    shortName: "Kling",
    description: "Perfect motion with advanced video control",
    modes: ["text-to-video", "image-to-video"],
    aspectRatios: ["1:1", "16:9", "9:16"],
    durations: ["5", "10"],
    supportsAudio: true,
    supportsPromptEnhancement: false,
    supportsNegativePrompt: false,
    maxPromptLength: 1000,
    maxImageSizeMB: 10,
    creditsPerSecond: {
      default: 20,
    },
  },
  "wan-2.5": {
    id: "wan-2.5",
    name: "Wan 2.5",
    shortName: "Wan",
    description: "Camera-controlled video with sound, more freedom",
    modes: ["text-to-video", "image-to-video"],
    aspectRatios: ["1:1", "16:9", "9:16"],
    durations: ["5", "10"],
    resolutions: ["720p", "1080p"],
    supportsAudio: false,
    supportsPromptEnhancement: true,
    supportsNegativePrompt: true,
    maxPromptLength: 800,
    maxImageSizeMB: 10,
    creditsPerSecond: {
      "720p": 12,
      "1080p": 20,
    },
  },
};

// Helper functions
export function getAvailableModels(): VideoModelConfig[] {
  return Object.values(VIDEO_MODELS);
}

export function getModelConfig(modelId: VideoModelId): VideoModelConfig {
  return VIDEO_MODELS[modelId];
}

export function getDefaultState(
  modelId: VideoModelId = "kling-2.6"
): VideoGenerationState {
  const config = VIDEO_MODELS[modelId];
  return {
    model: modelId,
    mode: "text-to-video",
    prompt: "",
    aspectRatio: "16:9",
    duration: "5",
    resolution: config.resolutions?.[0],
    audioEnabled: config.supportsAudio,
    enhanceEnabled: config.supportsPromptEnhancement,
  };
}

export function calculateCredits(state: VideoGenerationState): number {
  const config = VIDEO_MODELS[state.model];
  const duration = parseInt(state.duration);

  let creditsPerSecond = config.creditsPerSecond.default || 0;

  if (state.resolution && config.creditsPerSecond[state.resolution]) {
    creditsPerSecond = config.creditsPerSecond[state.resolution]!;
  }

  return creditsPerSecond * duration;
}

// Validation
export function validateState(state: VideoGenerationState): string[] {
  const errors: string[] = [];
  const config = VIDEO_MODELS[state.model];

  if (!state.prompt.trim()) {
    errors.push("Prompt is required");
  }

  if (state.prompt.length > config.maxPromptLength) {
    errors.push(`Prompt exceeds ${config.maxPromptLength} characters`);
  }

  if (state.mode === "image-to-video" && !state.imageUrl) {
    errors.push("Image is required for image-to-video");
  }

  if (!config.aspectRatios.includes(state.aspectRatio)) {
    errors.push(
      `Aspect ratio ${state.aspectRatio} not supported by ${config.name}`
    );
  }

  if (!config.durations.includes(state.duration)) {
    errors.push(`Duration ${state.duration}s not supported by ${config.name}`);
  }

  return errors;
}

// Convert UI state to API parameters
export function toKling26Params(state: VideoGenerationState) {
  if (state.mode === "text-to-video") {
    return {
      prompt: state.prompt,
      sound: state.audioEnabled,
      aspect_ratio: state.aspectRatio,
      duration: state.duration,
    };
  } else {
    return {
      prompt: state.prompt,
      image_urls: state.imageUrl ? [state.imageUrl] : [],
      sound: state.audioEnabled,
      duration: state.duration,
    };
  }
}

export function toWan25Params(state: VideoGenerationState) {
  const baseParams = {
    prompt: state.prompt,
    ...(state.negativePrompt && { negative_prompt: state.negativePrompt }),
    resolution: state.resolution || "720p",
    duration: state.duration,
    enable_prompt_expansion: state.enhanceEnabled,
    ...(state.seed !== undefined && { seed: state.seed }),
  };

  if (state.mode === "text-to-video") {
    return {
      ...baseParams,
      aspect_ratio: state.aspectRatio,
    };
  } else {
    return {
      ...baseParams,
      image_url: state.imageUrl || "",
    };
  }
}

export function toApiParams(state: VideoGenerationState) {
  switch (state.model) {
    case "kling-2.6":
      return toKling26Params(state);
    case "wan-2.5":
      return toWan25Params(state);
    default:
      throw new Error(`Unknown model: ${state.model}`);
  }
}
