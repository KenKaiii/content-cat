"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { GeneratedVideo } from "@/components/video";
import { apiFetch } from "@/lib/csrf";

export function useVideoHistory() {
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch videos from database with pagination
  const fetchVideos = useCallback(async (cursor?: string) => {
    try {
      const url = cursor
        ? `/api/videos?cursor=${cursor}&limit=20`
        : "/api/videos?limit=20";
      const response = await apiFetch(url, { timeout: 15000 });
      if (response.ok) {
        const result = await response.json();
        if (cursor) {
          // Append to existing videos
          setGeneratedVideos((prev) => [...prev, ...result.data]);
        } else {
          // Initial load
          setGeneratedVideos(result.data);
          if (result.data.length > 0) {
            setShowResults(true);
          }
        }
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
      }
    } catch {
      // Silently fail - videos will show empty state
    } finally {
      setIsLoadingVideos(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Load more videos
  const loadMoreVideos = useCallback(async () => {
    if (!hasMore || isLoadingMore || !nextCursor) return;
    setIsLoadingMore(true);
    await fetchVideos(nextCursor);
  }, [hasMore, isLoadingMore, nextCursor, fetchVideos]);

  // Fetch videos on mount
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Add a new video to the list
  const addVideo = useCallback((video: GeneratedVideo) => {
    setGeneratedVideos((prev) => [video, ...prev]);
  }, []);

  // Handle video deletion
  const handleDeleteVideo = useCallback(
    async (id: string) => {
      // Optimistic update
      setGeneratedVideos((prev) => prev.filter((v) => v.id !== id));

      try {
        const response = await apiFetch(`/api/videos/${id}`, {
          method: "DELETE",
          timeout: 15000,
        });
        if (!response.ok) {
          toast.error("Failed to delete video");
          fetchVideos(); // Revert on error
        }
      } catch {
        toast.error("Failed to delete video");
        fetchVideos(); // Revert on error
      }
    },
    [fetchVideos]
  );

  // Handle video download
  const handleDownloadVideo = useCallback(
    async (url: string, prompt: string) => {
      let blobUrl: string | null = null;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          toast.error("Failed to download video");
          return;
        }
        const blob = await response.blob();
        blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        toast.error("Failed to download video");
      } finally {
        // Always revoke blob URL to prevent memory leaks
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
        }
      }
    },
    []
  );

  // Copy prompt to clipboard
  const handleCopyPrompt = useCallback((prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied to clipboard");
  }, []);

  return {
    // State
    generatedVideos,
    isLoadingVideos,
    showResults,
    hasVideos: generatedVideos.length > 0,
    hasMore,
    isLoadingMore,

    // Actions
    setShowResults,
    addVideo,
    fetchVideos,
    loadMoreVideos,
    handleDeleteVideo,
    handleDownloadVideo,
    handleCopyPrompt,
  };
}
