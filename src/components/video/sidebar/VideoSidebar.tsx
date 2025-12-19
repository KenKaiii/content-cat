"use client";

import { useState } from "react";
import type {
  VideoModelId,
  VideoGenerationState,
  VideoAspectRatio,
  VideoDuration,
  VideoResolution,
  VideoModelConfig,
} from "@/lib/fal";
import { SparkleIcon, ExportIcon } from "../icons";
import { getDefaultEditState, type EditVideoState } from "../constants";
import CreateVideoForm from "./CreateVideoForm";
import EditVideoForm from "./EditVideoForm";

interface VideoSidebarProps {
  // Video generation state
  videoState: VideoGenerationState;
  modelConfig: VideoModelConfig;
  credits: number;
  isGenerating: boolean;
  // Image upload state
  startImageUrl: string | null;
  endImageUrl: string | null;
  isSwapping: boolean;
  startImageInputRef: React.RefObject<HTMLInputElement | null>;
  endImageInputRef: React.RefObject<HTMLInputElement | null>;
  // Handlers
  onUpdateVideoState: (updates: Partial<VideoGenerationState>) => void;
  onModelChange: (modelId: VideoModelId) => void;
  onDurationChange: (duration: VideoDuration) => void;
  onAspectChange: (aspectRatio: VideoAspectRatio) => void;
  onResolutionChange: (resolution: VideoResolution) => void;
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "start" | "end" | "single"
  ) => void;
  onClearImage: (type: "start" | "end" | "single") => void;
  onSwapImages: () => void;
  onGenerate: () => void;
}

export default function VideoSidebar({
  videoState,
  modelConfig,
  credits,
  isGenerating,
  startImageUrl,
  endImageUrl,
  isSwapping,
  startImageInputRef,
  endImageInputRef,
  onUpdateVideoState,
  onModelChange,
  onDurationChange,
  onAspectChange,
  onResolutionChange,
  onImageUpload,
  onClearImage,
  onSwapImages,
  onGenerate,
}: VideoSidebarProps) {
  const [activeTab, setActiveTab] = useState<"create" | "edit">("create");
  const [editState, setEditState] = useState<EditVideoState>(
    getDefaultEditState()
  );

  const updateEditState = (updates: Partial<EditVideoState>) => {
    setEditState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <aside className="mb-4 ml-4 flex w-80 flex-col rounded-2xl bg-zinc-900/50">
      {/* Tabs */}
      <nav className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
        <button
          onClick={() => setActiveTab("create")}
          className={`-mb-3 border-b-2 pb-2 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === "create"
              ? "border-white text-white"
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          Create Video
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={`-mb-3 border-b-2 pb-2 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === "edit"
              ? "border-white text-white"
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          Edit Video
        </button>
      </nav>

      {/* Scrollable Content */}
      <div className="hide-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {activeTab === "create" ? (
          <CreateVideoForm
            videoState={videoState}
            modelConfig={modelConfig}
            startImageUrl={startImageUrl}
            endImageUrl={endImageUrl}
            isSwapping={isSwapping}
            startImageInputRef={startImageInputRef}
            endImageInputRef={endImageInputRef}
            onUpdateVideoState={onUpdateVideoState}
            onModelChange={onModelChange}
            onDurationChange={onDurationChange}
            onAspectChange={onAspectChange}
            onResolutionChange={onResolutionChange}
            onImageUpload={onImageUpload}
            onClearImage={onClearImage}
            onSwapImages={onSwapImages}
          />
        ) : (
          <EditVideoForm
            editState={editState}
            onUpdateEditState={updateEditState}
          />
        )}
      </div>

      {/* Generate/Export Button - Fixed at bottom */}
      <div className="px-4 pt-3 pb-4">
        {activeTab === "create" ? (
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 text-sm font-semibold text-black shadow-[inset_0px_-3px_rgba(0,0,0,0.25)] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                Generating...
              </>
            ) : (
              <>
                Generate
                <div className="flex items-center gap-0.5">
                  <SparkleIcon />
                  {credits}
                </div>
              </>
            )}
          </button>
        ) : (
          <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 text-sm font-semibold text-black shadow-[inset_0px_-3px_rgba(0,0,0,0.25)] transition hover:bg-cyan-300">
            <ExportIcon />
            Export Video
          </button>
        )}
      </div>
    </aside>
  );
}
