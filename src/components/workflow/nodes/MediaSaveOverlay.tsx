"use client";

import { memo, useCallback, useState } from "react";

const DownloadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// Helper function to download media
export async function downloadMedia(
  mediaUrl: string,
  mediaType: "image" | "video"
) {
  try {
    const response = await fetch(mediaUrl);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const urlParts = mediaUrl.split("/");
    const filename =
      urlParts[urlParts.length - 1] ||
      `download.${mediaType === "video" ? "mp4" : "png"}`;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download:", error);
    window.open(mediaUrl, "_blank");
  }
}

interface MediaSaveOverlayProps {
  mediaUrl: string;
  mediaType: "image" | "video";
  children: React.ReactNode;
}

const MediaSaveOverlay = memo(function MediaSaveOverlay({
  mediaUrl,
  mediaType,
  children,
}: MediaSaveOverlayProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      await downloadMedia(mediaUrl, mediaType);
    },
    [mediaUrl, mediaType]
  );

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      {/* Overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          opacity: isHovered ? 1 : 0,
          pointerEvents: isHovered ? "auto" : "none",
        }}
      >
        {/* Save Button */}
        <button
          onClick={handleSave}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/30"
        >
          <DownloadIcon />
        </button>
      </div>
    </div>
  );
});

// Compact save button for video overlays
interface VideoSaveButtonProps {
  videoUrl: string;
  show: boolean;
}

export const VideoSaveButton = memo(function VideoSaveButton({
  videoUrl,
  show,
}: VideoSaveButtonProps) {
  const handleSave = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      await downloadMedia(videoUrl, "video");
    },
    [videoUrl]
  );

  return (
    <button
      onClick={handleSave}
      className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 text-[10px] text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/80"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translate3d(0, 0, 0)" : "translate3d(0, 4px, 0)",
        pointerEvents: show ? "auto" : "none",
        willChange: "transform, opacity",
      }}
    >
      <DownloadIcon />
      Save
    </button>
  );
});

export default MediaSaveOverlay;
