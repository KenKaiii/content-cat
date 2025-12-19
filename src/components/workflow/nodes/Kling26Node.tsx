"use client";

import { memo, useRef, useState, useEffect, useCallback } from "react";
import type { NodeProps, Node } from "@xyflow/react";
import BaseNode from "./BaseNode";
import type { Kling26NodeData } from "../types";

const UploadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const UploadIconSmall = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const LibraryIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const NODE_WIDTH = 248;
const DEFAULT_ASPECT_RATIO = 4 / 4.25;
const containerHeight = Math.round(NODE_WIDTH / DEFAULT_ASPECT_RATIO);

const Kling26Node = memo(function Kling26Node({
  data,
  selected,
}: NodeProps<Node<Kling26NodeData>>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<string>("0:00");

  useEffect(() => {
    if (data.videoUrl && videoRef.current) {
      const video = videoRef.current;

      const handleLoadedMetadata = () => {
        const mins = Math.floor(video.duration / 60);
        const secs = Math.floor(video.duration % 60);
        setDuration(`${mins}:${secs.toString().padStart(2, "0")}`);
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () =>
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    }
  }, [data.videoUrl]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        if (videoRef.current) {
          videoRef.current.src = url;
        }
      }
    },
    []
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const togglePlayback = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return (
    <BaseNode
      label={data.label || "Kling 2.6 Pro"}
      selected={selected}
      inputs={[
        { id: "prompt", label: "Prompt", color: "#A78BFA" },
        { id: "video", label: "Video", color: "#EF9092" },
        { id: "image", label: "Image", color: "#F59E0B" },
      ]}
      outputs={[{ id: "video", label: "Video", color: "#6EDDB3" }]}
    >
      <div className="flex flex-col gap-3">
        {/* Video Container */}
        <div
          className="nodrag relative w-full overflow-hidden rounded-lg"
          style={{
            backgroundColor: "rgb(31, 31, 35)",
            height: containerHeight,
          }}
        >
          {data.videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={data.videoUrl}
                className="h-full w-full object-contain"
                onClick={togglePlayback}
                onEnded={handleVideoEnded}
              />
              {!isPlaying && (
                <div
                  className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 transition-opacity hover:bg-black/40"
                  onClick={togglePlayback}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                    <PlayIcon />
                  </div>
                </div>
              )}
              <div className="absolute right-2 bottom-2 rounded bg-black/60 px-1.5 py-0.5 text-[8px] text-white">
                {duration}
              </div>
            </>
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #1f1f23 25%, transparent 25%),
                  linear-gradient(-45deg, #1f1f23 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #1f1f23 75%),
                  linear-gradient(-45deg, transparent 75%, #1f1f23 75%)
                `,
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                backgroundColor: "#2b2b2f",
              }}
            >
              <button
                onClick={handleUploadClick}
                className="nodrag inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-medium text-cyan-400 backdrop-blur-sm transition-all hover:bg-cyan-400/20"
              >
                <UploadIcon />
                Upload
              </button>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleUploadClick}
            className="flex flex-1 items-center justify-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-[8px] text-gray-300 transition-colors hover:border-zinc-600 hover:text-white"
          >
            <UploadIconSmall />
            Upload
          </button>
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-[8px] text-gray-300 transition-colors hover:border-zinc-600 hover:text-white">
            <LibraryIcon />
            Library
          </button>
        </div>

        {/* Model badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-[8px] text-gray-400">Native Audio</span>
          </div>
          <span className="text-[8px] text-gray-500">$0.35/5s</span>
        </div>
      </div>
    </BaseNode>
  );
});

export default Kling26Node;
