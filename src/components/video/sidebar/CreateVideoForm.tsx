"use client";

import { useState, useRef } from "react";
import { NestedDropdown, SimpleDropdown } from "@/components/Dropdown";
import type {
  VideoModelId,
  VideoGenerationState,
  VideoAspectRatio,
  VideoDuration,
  VideoResolution,
  VideoModelConfig,
} from "@/lib/fal";
import { ChevronDownIcon, InfoIcon, EditIcon } from "../icons";
import { getModelGroups } from "../constants";
import ImageUploadSection from "./ImageUploadSection";
import PromptSection from "./PromptSection";
import PresetSelector from "@/components/PresetSelector";

interface CreateVideoFormProps {
  // Video state
  videoState: VideoGenerationState;
  modelConfig: VideoModelConfig;
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
}

export default function CreateVideoForm({
  videoState,
  modelConfig,
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
}: CreateVideoFormProps) {
  // Local UI state
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("General");

  // Dropdown visibility states
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [showAspectDropdown, setShowAspectDropdown] = useState(false);
  const [showResolutionDropdown, setShowResolutionDropdown] = useState(false);

  // Dropdown trigger refs
  const modelTriggerRef = useRef<HTMLButtonElement>(null);
  const durationTriggerRef = useRef<HTMLButtonElement>(null);
  const aspectTriggerRef = useRef<HTMLButtonElement>(null);
  const resolutionTriggerRef = useRef<HTMLButtonElement>(null);

  const handleModelChangeWithDropdown = (modelId: VideoModelId) => {
    onModelChange(modelId);
    setShowModelDropdown(false);
  };

  const handleDurationChangeWithDropdown = (duration: VideoDuration) => {
    onDurationChange(duration);
    setShowDurationDropdown(false);
  };

  const handleAspectChangeWithDropdown = (aspectRatio: VideoAspectRatio) => {
    onAspectChange(aspectRatio);
    setShowAspectDropdown(false);
  };

  const handleResolutionChangeWithDropdown = (resolution: VideoResolution) => {
    onResolutionChange(resolution);
    setShowResolutionDropdown(false);
  };

  if (showPresetSelector) {
    return (
      <PresetSelector
        isOpen={showPresetSelector}
        onClose={() => setShowPresetSelector(false)}
        onSelectPreset={(preset) => setSelectedPreset(preset)}
      />
    );
  }

  return (
    <>
      {/* Preset Card */}
      <figure
        className="group relative aspect-[2.3] w-full cursor-pointer overflow-hidden rounded-xl select-none"
        onClick={() => setShowPresetSelector(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-amber-900" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 50%)",
          }}
        />
        <figcaption className="absolute bottom-0 left-0 z-10 w-full pr-1.5 pb-3 pl-3">
          <p className="font-heading w-full truncate text-lg font-bold text-cyan-400 uppercase">
            {selectedPreset}
          </p>
          <p className="text-xs text-white/80">{modelConfig.name}</p>
        </figcaption>
        <button
          className="absolute top-1.5 right-1.5 z-20 flex h-6 items-center gap-1 rounded-lg border border-white/10 bg-black/60 px-2 text-xs text-white backdrop-blur-sm transition-colors hover:bg-cyan-400 hover:text-black"
          onClick={(e) => {
            e.stopPropagation();
            setShowPresetSelector(true);
          }}
        >
          <EditIcon />
          Change
        </button>
      </figure>

      {/* Upload Image Section */}
      <ImageUploadSection
        supportsStartEndFrames={modelConfig.supportsStartEndFrames}
        startImageUrl={startImageUrl}
        endImageUrl={endImageUrl}
        isSwapping={isSwapping}
        startImageInputRef={startImageInputRef}
        endImageInputRef={endImageInputRef}
        onImageUpload={onImageUpload}
        onClearImage={onClearImage}
        onSwapImages={onSwapImages}
        singleImageUrl={videoState.imageUrl}
      />

      {/* Prompt Section */}
      <PromptSection
        prompt={videoState.prompt}
        maxLength={modelConfig.maxPromptLength}
        enhanceEnabled={videoState.enhanceEnabled}
        supportsPromptEnhancement={modelConfig.supportsPromptEnhancement}
        onPromptChange={(prompt) => onUpdateVideoState({ prompt })}
        onEnhanceToggle={() =>
          onUpdateVideoState({ enhanceEnabled: !videoState.enhanceEnabled })
        }
      />

      {/* Audio Toggle - Only show if model supports audio */}
      {modelConfig.supportsAudio && (
        <fieldset>
          <div className="rounded-xl bg-zinc-800/50 p-3">
            <div className="flex flex-row items-center justify-between gap-1.5">
              <div className="flex shrink-0 items-center gap-1 text-sm text-white">
                <span className="font-medium">Audio</span>
                <button className="text-gray-500">
                  <InfoIcon />
                </button>
              </div>
              <button
                onClick={() =>
                  onUpdateVideoState({
                    audioEnabled: !videoState.audioEnabled,
                  })
                }
                className={`relative inline-flex h-6 w-9 shrink-0 cursor-pointer items-center rounded-full transition ${
                  videoState.audioEnabled ? "bg-cyan-400" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`pointer-events-none absolute top-1/2 left-0.5 h-4 w-4 -translate-y-1/2 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                    videoState.audioEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </fieldset>
      )}

      {/* Model Selection */}
      <fieldset className="relative">
        <button
          ref={modelTriggerRef}
          onClick={() => setShowModelDropdown(!showModelDropdown)}
          className="grid w-full grid-cols-[1fr_auto] items-center gap-2 rounded-xl bg-zinc-800/50 px-3 py-2.5 text-left transition hover:bg-zinc-700/50"
        >
          <div className="grid">
            <span className="text-xs font-medium whitespace-nowrap text-gray-500">
              Model
            </span>
            <div className="text-sm font-medium text-white">
              {modelConfig.name}
            </div>
          </div>
          <ChevronDownIcon />
        </button>
        <NestedDropdown
          isOpen={showModelDropdown}
          onClose={() => setShowModelDropdown(false)}
          value={videoState.model}
          onChange={(id) => handleModelChangeWithDropdown(id as VideoModelId)}
          triggerRef={modelTriggerRef}
          groups={getModelGroups()}
        />
      </fieldset>

      {/* Duration & Aspect Ratio */}
      <fieldset>
        <div className="flex w-full items-center gap-2">
          {/* Duration Dropdown */}
          <div className="relative flex-1">
            <button
              ref={durationTriggerRef}
              onClick={() => setShowDurationDropdown(!showDurationDropdown)}
              className="grid w-full grid-cols-[1fr_auto] items-center gap-2 rounded-xl bg-zinc-800/50 px-3 py-2.5 text-left transition hover:bg-zinc-700/50"
            >
              <div className="grid">
                <span className="text-xs font-medium whitespace-nowrap text-gray-500">
                  Duration
                </span>
                <div className="text-sm font-medium text-white">
                  {videoState.duration}s
                </div>
              </div>
              <ChevronDownIcon />
            </button>
            <SimpleDropdown
              isOpen={showDurationDropdown}
              onClose={() => setShowDurationDropdown(false)}
              value={videoState.duration}
              onChange={(id) =>
                handleDurationChangeWithDropdown(id as VideoDuration)
              }
              triggerRef={durationTriggerRef}
              options={modelConfig.durations.map((d) => ({
                id: d,
                label: `${d} seconds`,
              }))}
            />
          </div>

          {/* Aspect Ratio Dropdown */}
          <div className="relative flex-1">
            <button
              ref={aspectTriggerRef}
              onClick={() => setShowAspectDropdown(!showAspectDropdown)}
              className="grid w-full grid-cols-[1fr_auto] items-center gap-2 rounded-xl bg-zinc-800/50 px-3 py-2.5 text-left transition hover:bg-zinc-700/50"
            >
              <div className="grid">
                <span className="text-xs font-medium whitespace-nowrap text-gray-500">
                  Aspect Ratio
                </span>
                <div className="text-sm font-medium text-white">
                  {videoState.aspectRatio}
                </div>
              </div>
              <ChevronDownIcon />
            </button>
            <SimpleDropdown
              isOpen={showAspectDropdown}
              onClose={() => setShowAspectDropdown(false)}
              value={videoState.aspectRatio}
              onChange={(id) =>
                handleAspectChangeWithDropdown(id as VideoAspectRatio)
              }
              triggerRef={aspectTriggerRef}
              options={modelConfig.aspectRatios.map((ar) => ({
                id: ar,
                label: ar,
              }))}
            />
          </div>
        </div>
      </fieldset>

      {/* Resolution - Only show if model supports multiple resolutions */}
      {modelConfig.resolutions && modelConfig.resolutions.length > 0 && (
        <fieldset className="relative">
          <button
            ref={resolutionTriggerRef}
            onClick={() => setShowResolutionDropdown(!showResolutionDropdown)}
            className="grid w-full grid-cols-[1fr_auto] items-center gap-2 rounded-xl bg-zinc-800/50 px-3 py-2.5 text-left transition hover:bg-zinc-700/50"
          >
            <div className="grid">
              <span className="text-xs font-medium whitespace-nowrap text-gray-500">
                Resolution
              </span>
              <div className="text-sm font-medium text-white">
                {videoState.resolution || modelConfig.resolutions[0]}
              </div>
            </div>
            <ChevronDownIcon />
          </button>
          <SimpleDropdown
            isOpen={showResolutionDropdown}
            onClose={() => setShowResolutionDropdown(false)}
            value={videoState.resolution || modelConfig.resolutions[0]}
            onChange={(id) =>
              handleResolutionChangeWithDropdown(id as VideoResolution)
            }
            triggerRef={resolutionTriggerRef}
            options={modelConfig.resolutions.map((res) => ({
              id: res,
              label: res,
            }))}
          />
        </fieldset>
      )}
    </>
  );
}
