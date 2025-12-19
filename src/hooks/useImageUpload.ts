"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { compressImage } from "@/lib/utils/image-compression";

interface UseImageUploadOptions {
  onStartImageChange?: (url: string | undefined) => void;
  onEndImageChange?: (url: string | undefined) => void;
  onSingleImageChange?: (url: string | undefined) => void;
  onModeChange?: (mode: "text-to-video" | "image-to-video") => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const {
    onStartImageChange,
    onEndImageChange,
    onSingleImageChange,
    onModeChange,
  } = options;

  // Image state
  const [startImageUrl, setStartImageUrl] = useState<string | null>(null);
  const [endImageUrl, setEndImageUrl] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);

  // Refs for file inputs
  const startImageInputRef = useRef<HTMLInputElement>(null);
  const endImageInputRef = useRef<HTMLInputElement>(null);
  const singleImageInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload for start/end frames or single image
  const handleImageUpload = useCallback(
    async (
      e: React.ChangeEvent<HTMLInputElement>,
      type: "start" | "end" | "single"
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        // Compress and convert to base64 data URI for fal.ai API compatibility
        const base64Url = await compressImage(file);

        if (type === "start") {
          setStartImageUrl(base64Url);
          onStartImageChange?.(base64Url);
          onModeChange?.("image-to-video");
        } else if (type === "end") {
          setEndImageUrl(base64Url);
          onEndImageChange?.(base64Url);
        } else {
          // Single image upload (for non-start/end frame models)
          onSingleImageChange?.(base64Url);
          onModeChange?.("image-to-video");
        }
      } catch (error) {
        console.error("Failed to process image:", error);
        toast.error("Failed to process image. Please try again.");
      }
    },
    [onStartImageChange, onEndImageChange, onSingleImageChange, onModeChange]
  );

  // Clear image
  const clearImage = useCallback(
    (type: "start" | "end" | "single") => {
      if (type === "start") {
        setStartImageUrl(null);
        onStartImageChange?.(undefined);
        onModeChange?.("text-to-video");
        if (startImageInputRef.current) startImageInputRef.current.value = "";
      } else if (type === "end") {
        setEndImageUrl(null);
        onEndImageChange?.(undefined);
        if (endImageInputRef.current) endImageInputRef.current.value = "";
      } else {
        onSingleImageChange?.(undefined);
        onModeChange?.("text-to-video");
        if (singleImageInputRef.current) singleImageInputRef.current.value = "";
      }
    },
    [onStartImageChange, onEndImageChange, onSingleImageChange, onModeChange]
  );

  // Swap start and end images
  const swapImages = useCallback(() => {
    setIsSwapping(true);
    // Fade out, swap, then fade in
    setTimeout(() => {
      const tempStart = startImageUrl;
      const tempEnd = endImageUrl;
      setStartImageUrl(tempEnd);
      setEndImageUrl(tempStart);
      onStartImageChange?.(tempEnd || undefined);
      onEndImageChange?.(tempStart || undefined);
      if (tempEnd) {
        onModeChange?.("image-to-video");
      } else {
        onModeChange?.("text-to-video");
      }
      setTimeout(() => {
        setIsSwapping(false);
      }, 50);
    }, 150);
  }, [
    startImageUrl,
    endImageUrl,
    onStartImageChange,
    onEndImageChange,
    onModeChange,
  ]);

  // Reset all images (useful when switching models)
  const resetImages = useCallback(() => {
    setStartImageUrl(null);
    setEndImageUrl(null);
    if (startImageInputRef.current) startImageInputRef.current.value = "";
    if (endImageInputRef.current) endImageInputRef.current.value = "";
  }, []);

  // Attach image from a video result (cycles: first -> last -> reset)
  const attachImageFromResult = useCallback(
    (imageUrl: string, supportsStartEndFrames: boolean) => {
      if (supportsStartEndFrames) {
        // If no start image yet, or both are filled, set as start (reset)
        if (!startImageUrl || (startImageUrl && endImageUrl)) {
          // Reset: clear end image and set new start image
          setStartImageUrl(imageUrl);
          setEndImageUrl(null);
          onStartImageChange?.(imageUrl);
          onEndImageChange?.(undefined);
          onModeChange?.("image-to-video");
          toast.success("Start image attached");
        } else {
          // Start image exists but no end image, set as end
          setEndImageUrl(imageUrl);
          onEndImageChange?.(imageUrl);
          toast.success("End image attached");
        }
      } else {
        // Model doesn't support end frames, just replace start/single image
        setStartImageUrl(imageUrl);
        onSingleImageChange?.(imageUrl);
        onModeChange?.("image-to-video");
        toast.success("Image attached");
      }
    },
    [
      startImageUrl,
      endImageUrl,
      onStartImageChange,
      onEndImageChange,
      onSingleImageChange,
      onModeChange,
    ]
  );

  return {
    // State
    startImageUrl,
    endImageUrl,
    isSwapping,

    // Refs
    startImageInputRef,
    endImageInputRef,
    singleImageInputRef,

    // Actions
    handleImageUpload,
    clearImage,
    swapImages,
    resetImages,
    attachImageFromResult,
  };
}
