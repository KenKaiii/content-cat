"use client";

import { useState } from "react";
import Header from "@/components/Header";
import PresetSelector from "@/components/PresetSelector";
import {
  VideoSidebar,
  VideoHistoryView,
  HowItWorksSection,
  FolderIcon,
  BookIcon,
} from "@/components/video";
import { useVideoGeneration, useVideoHistory, useImageUpload } from "@/hooks";
import type { VideoModelId } from "@/lib/fal";

export default function VideoPage() {
  const [showPresetSelector, setShowPresetSelector] = useState(false);

  // Video history management
  const {
    generatedVideos,
    isLoadingVideos,
    showResults,
    setShowResults,
    addVideo,
    handleDeleteVideo,
    handleDownloadVideo,
    handleCopyPrompt,
  } = useVideoHistory();

  // Video generation state
  const {
    videoState,
    modelConfig,
    credits,
    pendingCount,
    isGenerating,
    updateVideoState,
    handleModelChange,
    handleDurationChange,
    handleAspectChange,
    handleResolutionChange,
    handleGenerate,
    handleRerunVideo,
  } = useVideoGeneration({
    onVideoGenerated: (video) => {
      addVideo(video);
    },
  });

  // Image upload handling
  const {
    startImageUrl,
    endImageUrl,
    isSwapping,
    startImageInputRef,
    endImageInputRef,
    handleImageUpload,
    clearImage,
    swapImages,
    resetImages,
    attachImageFromResult,
  } = useImageUpload({
    onStartImageChange: (url) => updateVideoState({ imageUrl: url }),
    onEndImageChange: (url) => updateVideoState({ endImageUrl: url }),
    onSingleImageChange: (url) => updateVideoState({ imageUrl: url }),
    onModeChange: (mode) => updateVideoState({ mode }),
  });

  // Handle model change with image reset
  const handleModelChangeWithReset = (modelId: VideoModelId) => {
    handleModelChange(modelId, {
      onStartEndFrameReset: resetImages,
    });
  };

  // Handle generate with results view
  const handleGenerateWithView = async () => {
    const success = await handleGenerate();
    if (success) {
      setShowResults(true);
    }
  };

  // Handle attach images from video result
  const handleAttachImages = (imageUrl?: string) => {
    if (imageUrl) {
      attachImageFromResult(imageUrl, modelConfig.supportsStartEndFrames);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0a0a]">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <VideoSidebar
          videoState={videoState}
          modelConfig={modelConfig}
          credits={credits}
          isGenerating={isGenerating}
          startImageUrl={startImageUrl}
          endImageUrl={endImageUrl}
          isSwapping={isSwapping}
          startImageInputRef={startImageInputRef}
          endImageInputRef={endImageInputRef}
          onUpdateVideoState={updateVideoState}
          onModelChange={handleModelChangeWithReset}
          onDurationChange={handleDurationChange}
          onAspectChange={handleAspectChange}
          onResolutionChange={handleResolutionChange}
          onImageUpload={handleImageUpload}
          onClearImage={clearImage}
          onSwapImages={swapImages}
          onGenerate={handleGenerateWithView}
        />

        {/* Main Content */}
        <main className="relative flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-4 pb-4">
          {showPresetSelector ? (
            /* Preset Selector View */
            <PresetSelector
              isOpen={showPresetSelector}
              onClose={() => setShowPresetSelector(false)}
              onSelectPreset={() => {}}
            />
          ) : (
            <>
              {/* Shared Tabs with sliding indicator */}
              <div className="z-10 mb-4 w-fit">
                <nav className="relative flex gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1">
                  {/* Sliding indicator */}
                  <div
                    className={`absolute top-1 bottom-1 left-1 w-[120px] rounded-lg border border-zinc-700 bg-white/10 transition-all duration-200 ease-out ${
                      showResults || pendingCount > 0
                        ? "translate-x-0"
                        : "translate-x-[124px]"
                    }`}
                  />
                  <button
                    onClick={() => setShowResults(true)}
                    className={`relative z-10 flex w-[120px] items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                      showResults || pendingCount > 0
                        ? "text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <FolderIcon />
                    History
                  </button>
                  <button
                    onClick={() => setShowResults(false)}
                    className={`relative z-10 flex w-[120px] items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                      showResults || pendingCount > 0
                        ? "text-gray-400 hover:text-white"
                        : "text-white"
                    }`}
                  >
                    <BookIcon />
                    How it works
                  </button>
                </nav>
              </div>

              {/* Content area */}
              {showResults || pendingCount > 0 ? (
                <VideoHistoryView
                  videos={generatedVideos}
                  isLoading={isLoadingVideos}
                  pendingCount={pendingCount}
                  onRerun={handleRerunVideo}
                  onDelete={handleDeleteVideo}
                  onDownload={handleDownloadVideo}
                  onCopy={handleCopyPrompt}
                  onAttachImages={handleAttachImages}
                />
              ) : (
                <HowItWorksSection />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
