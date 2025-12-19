"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  getDefaultState,
  getModelConfig,
  calculatePrice,
  type VideoModelId,
  type VideoGenerationState,
  type VideoAspectRatio,
  type VideoDuration,
  type VideoResolution,
} from "@/lib/fal";
import type { GeneratedVideo } from "@/components/video";

interface UseVideoGenerationOptions {
  onVideoGenerated?: (video: GeneratedVideo) => void;
}

export function useVideoGeneration(options: UseVideoGenerationOptions = {}) {
  const { onVideoGenerated } = options;

  // Video generation state
  const [videoState, setVideoState] = useState<VideoGenerationState>(
    getDefaultState("kling-2.6")
  );
  const [pendingCount, setPendingCount] = useState(0);

  // Get current model config and price
  const modelConfig = getModelConfig(videoState.model);
  const credits = calculatePrice(videoState);
  const isGenerating = pendingCount > 0;

  // Update handlers
  const updateVideoState = useCallback(
    (updates: Partial<VideoGenerationState>) => {
      setVideoState((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleModelChange = useCallback(
    (
      modelId: VideoModelId,
      callbacks?: {
        onStartEndFrameReset?: () => void;
      }
    ) => {
      const newConfig = getModelConfig(modelId);
      const oldConfig = getModelConfig(videoState.model);

      // Reset start/end frames when switching between frame support models
      if (
        oldConfig.supportsStartEndFrames !== newConfig.supportsStartEndFrames
      ) {
        callbacks?.onStartEndFrameReset?.();
      }

      setVideoState({
        ...getDefaultState(modelId),
        prompt: videoState.prompt,
        // Only preserve imageUrl if the new model doesn't support start/end frames
        imageUrl: newConfig.supportsStartEndFrames
          ? undefined
          : videoState.imageUrl,
        endImageUrl: undefined, // Always reset end image when switching models
        mode: newConfig.supportsStartEndFrames
          ? "text-to-video"
          : videoState.mode,
      });
    },
    [videoState.prompt, videoState.imageUrl, videoState.mode, videoState.model]
  );

  const handleDurationChange = useCallback((duration: VideoDuration) => {
    setVideoState((prev) => ({ ...prev, duration }));
  }, []);

  const handleAspectChange = useCallback((aspectRatio: VideoAspectRatio) => {
    setVideoState((prev) => ({ ...prev, aspectRatio }));
  }, []);

  const handleResolutionChange = useCallback((resolution: VideoResolution) => {
    setVideoState((prev) => ({ ...prev, resolution }));
  }, []);

  // Handle video generation
  const handleGenerate = useCallback(async () => {
    if (!videoState.prompt.trim()) {
      toast.error("Please enter a prompt");
      return false;
    }

    // Add skeleton
    setPendingCount((prev) => prev + 1);

    // Fire-and-forget generation
    const generateVideo = async () => {
      try {
        const response = await fetch("/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: videoState.prompt,
            model: videoState.model,
            mode: videoState.mode,
            aspectRatio: videoState.aspectRatio,
            duration: videoState.duration,
            resolution: videoState.resolution,
            audioEnabled: videoState.audioEnabled,
            enhanceEnabled: videoState.enhanceEnabled,
            imageUrl: videoState.imageUrl,
            endImageUrl: videoState.endImageUrl,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          toast.error(result.error || "Failed to generate video");
          setPendingCount((prev) => Math.max(0, prev - 1));
          return;
        }

        if (result.video) {
          onVideoGenerated?.(result.video);
          toast.success("Video generated successfully!");
        }

        setPendingCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Something went wrong"
        );
        setPendingCount((prev) => Math.max(0, prev - 1));
      }
    };

    // Start generation with proper error handling
    generateVideo().catch((error) => {
      // Catch any unhandled errors to prevent crashes
      console.error("Unhandled error in video generation:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setPendingCount((prev) => Math.max(0, prev - 1));
    });

    return true;
  }, [videoState, onVideoGenerated]);

  // Handle rerun with settings from a video
  const handleRerunVideo = useCallback((video: GeneratedVideo) => {
    setVideoState({
      ...getDefaultState(video.model as VideoModelId),
      prompt: video.prompt,
      model: video.model as VideoModelId,
      duration: String(video.duration) as VideoDuration,
      aspectRatio: video.aspectRatio as VideoAspectRatio,
      resolution: video.resolution as VideoResolution,
      imageUrl: video.startImageUrl,
    });
  }, []);

  return {
    // State
    videoState,
    modelConfig,
    credits,
    pendingCount,
    isGenerating,

    // Actions
    updateVideoState,
    handleModelChange,
    handleDurationChange,
    handleAspectChange,
    handleResolutionChange,
    handleGenerate,
    handleRerunVideo,
  };
}
