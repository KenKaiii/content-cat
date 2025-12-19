"use client";

import type {
  WorkflowNode,
  Kling26NodeData,
  Kling25TurboNodeData,
  Wan26NodeData,
  NanoBananaProNodeData,
  VideoEditorNodeData,
} from "./types";

type ModelNodeData = Kling26NodeData | Kling25TurboNodeData | Wan26NodeData;
type ImageModelNodeData = NanoBananaProNodeData;
type EditorNodeData = VideoEditorNodeData;

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M11.25 11.25C11.4489 11.25 11.6397 11.329 11.7803 11.4697C11.921 11.6103 12 11.8011 12 12V15.75C12 15.9489 12.079 16.1397 12.2197 16.2803C12.3603 16.421 12.5511 16.5 12.75 16.5"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.625 8.8125C12.1428 8.8125 12.5625 8.39277 12.5625 7.875C12.5625 7.35723 12.1428 6.9375 11.625 6.9375C11.1072 6.9375 10.6875 7.35723 10.6875 7.875C10.6875 8.39277 11.1072 8.8125 11.625 8.8125Z"
      fill="currentColor"
    />
    <path
      d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CreditsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3.75V20.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 7.5L19.5 16.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 16.5L19.5 7.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M14.354 4.85403L6.35403 12.854C6.30759 12.9005 6.25245 12.9374 6.19175 12.9626C6.13105 12.9877 6.06599 13.0007 6.00028 13.0007C5.93457 13.0007 5.86951 12.9877 5.80881 12.9626C5.74811 12.9374 5.69296 12.9005 5.64653 12.854L2.14653 9.35403C2.05271 9.26021 2 9.13296 2 9.00028C2 8.8676 2.05271 8.74035 2.14653 8.64653C2.24035 8.55271 2.3676 8.5 2.50028 8.5C2.63296 8.5 2.76021 8.55271 2.85403 8.64653L6.00028 11.7934L13.6465 4.14653C13.7403 4.05271 13.8676 4 14.0003 4C14.133 4 14.2602 4.05271 14.354 4.14653C14.4478 4.24035 14.5006 4.3676 14.5006 4.50028C14.5006 4.63296 14.4478 4.76021 14.354 4.85403Z"
      fill="currentColor"
    />
  </svg>
);

const RunIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    style={{ transform: "rotate(90deg)" }}
  >
    <path
      d="M12 20.25L12 3.75"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.25 10.5L12 3.75L18.75 10.5"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface WorkflowPropertiesPanelProps {
  selectedNode?: WorkflowNode | null;
  onUpdateNode?: (nodeId: string, data: Partial<WorkflowNode["data"]>) => void;
}

// Model configuration type
interface ModelConfig {
  name: string;
  color: string;
  price: number;
  durations: string[];
  aspectRatios: string[];
  resolutions?: string[];
  supportsAudio: boolean;
  supportsCfgScale: boolean;
  supportsNegativePrompt: boolean;
  supportsSpecialFx?: boolean;
  supportsPromptEnhancement?: boolean;
}

// Model configurations
const MODEL_CONFIGS: Record<string, ModelConfig> = {
  kling26: {
    name: "Kling 2.6 Pro",
    color: "from-purple-500 to-blue-500",
    price: 0.35,
    durations: ["5", "10"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsAudio: true,
    supportsCfgScale: true,
    supportsNegativePrompt: true,
  },
  kling25Turbo: {
    name: "Kling 2.5 Turbo",
    color: "from-yellow-500 to-orange-500",
    price: 0.35,
    durations: ["5", "10"],
    aspectRatios: ["16:9", "9:16", "1:1"],
    supportsAudio: false,
    supportsCfgScale: true,
    supportsNegativePrompt: true,
    supportsSpecialFx: true,
  },
  wan26: {
    name: "Wan 2.6",
    color: "from-cyan-500 to-teal-500",
    price: 0.25,
    durations: ["5", "10", "15"],
    aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
    resolutions: ["720p", "1080p"],
    supportsAudio: false,
    supportsCfgScale: false,
    supportsNegativePrompt: true,
    supportsPromptEnhancement: true,
  },
};

const SPECIAL_FX_OPTIONS = [
  { value: "", label: "None" },
  { value: "hug", label: "Hug" },
  { value: "kiss", label: "Kiss" },
  { value: "heart_gesture", label: "Heart Gesture" },
  { value: "squish", label: "Squish" },
  { value: "expansion", label: "Expansion" },
  { value: "bloombloom", label: "Bloom" },
  { value: "dizzydizzy", label: "Dizzy" },
  { value: "jelly_press", label: "Jelly Press" },
  { value: "jelly_squish", label: "Jelly Squish" },
  { value: "pixelpixel", label: "Pixel" },
  { value: "yearbook", label: "Yearbook" },
  { value: "anime_figure", label: "Anime Figure" },
];

// Video Editor configuration
const VIDEO_EDITOR_CONFIG = {
  name: "Video Editor",
  color: "from-pink-500 to-rose-500",
  operations: [
    { value: "trim", label: "Trim & Cut" },
    { value: "concatenate", label: "Concatenate" },
    { value: "transition", label: "Add Transitions" },
    { value: "audio", label: "Add Audio" },
    { value: "subtitles", label: "Add Subtitles" },
    { value: "text", label: "Add Text" },
  ],
  transitions: [
    { value: "none", label: "None" },
    { value: "fade", label: "Fade" },
    { value: "crossfade", label: "Crossfade" },
    { value: "slideLeft", label: "Slide Left" },
    { value: "slideRight", label: "Slide Right" },
    { value: "slideUp", label: "Slide Up" },
    { value: "slideDown", label: "Slide Down" },
    { value: "zoomIn", label: "Zoom In" },
    { value: "zoomOut", label: "Zoom Out" },
    { value: "wipeLeft", label: "Wipe Left" },
    { value: "wipeRight", label: "Wipe Right" },
    { value: "blur", label: "Blur" },
    { value: "glitch", label: "Glitch" },
    { value: "flash", label: "Flash" },
  ],
  subtitleStyles: [
    { value: "classic", label: "Classic" },
    { value: "tiktok", label: "TikTok" },
    { value: "highlight", label: "Highlight" },
    { value: "minimal", label: "Minimal" },
    { value: "neon", label: "Neon" },
    { value: "karaoke", label: "Karaoke" },
  ],
  textPresets: [
    { value: "title", label: "Title" },
    { value: "hook", label: "Hook" },
    { value: "cta", label: "Call to Action" },
    { value: "lowerThird", label: "Lower Third" },
  ],
  textPositions: [
    { value: "top-left", label: "Top Left" },
    { value: "top-center", label: "Top Center" },
    { value: "top-right", label: "Top Right" },
    { value: "center-left", label: "Center Left" },
    { value: "center", label: "Center" },
    { value: "center-right", label: "Center Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-center", label: "Bottom Center" },
    { value: "bottom-right", label: "Bottom Right" },
  ],
  qualities: [
    { value: "draft", label: "Draft (2M, 24fps)" },
    { value: "normal", label: "Normal (5M, 30fps)" },
    { value: "high", label: "High (8M, 30fps)" },
    { value: "best", label: "Best (15M, 60fps)" },
  ],
  aspectRatios: [
    { value: "9:16", label: "9:16 (Vertical)" },
    { value: "16:9", label: "16:9 (Horizontal)" },
    { value: "1:1", label: "1:1 (Square)" },
    { value: "4:5", label: "4:5 (Portrait)" },
  ],
  resolutions: [
    { value: "720p", label: "720p" },
    { value: "1080p", label: "1080p" },
    { value: "4k", label: "4K" },
  ],
};

// Nano Banana Pro configuration
const NANO_BANANA_PRO_CONFIG = {
  name: "Nano Banana Pro",
  color: "from-yellow-500 to-amber-500",
  price: 0.04,
  modes: [
    { value: "text-to-image", label: "Text to Image" },
    { value: "image-edit", label: "Image Edit" },
  ],
  aspectRatios: [
    { value: "1:1", label: "1:1 (Square)" },
    { value: "16:9", label: "16:9 (Landscape)" },
    { value: "9:16", label: "9:16 (Portrait)" },
    { value: "4:3", label: "4:3" },
    { value: "3:4", label: "3:4" },
    { value: "3:2", label: "3:2" },
    { value: "2:3", label: "2:3" },
    { value: "21:9", label: "21:9 (Ultrawide)" },
    { value: "5:4", label: "5:4" },
    { value: "4:5", label: "4:5" },
  ],
  resolutions: [
    { value: "1K", label: "1K" },
    { value: "2K", label: "2K" },
    { value: "4K", label: "4K (2x cost)" },
  ],
  outputFormats: [
    { value: "png", label: "PNG" },
    { value: "jpeg", label: "JPEG" },
    { value: "webp", label: "WebP" },
  ],
};

export default function WorkflowPropertiesPanel({
  selectedNode,
  onUpdateNode,
}: WorkflowPropertiesPanelProps) {
  const nodeType = selectedNode?.type as string | undefined;
  const isModelNode = nodeType && nodeType in MODEL_CONFIGS;
  const isVideoEditor = nodeType === "videoEditor";
  const isNanoBananaPro = nodeType === "nanoBananaPro";
  const config = isModelNode
    ? MODEL_CONFIGS[nodeType as keyof typeof MODEL_CONFIGS]
    : null;
  const nodeData = (selectedNode?.data || {}) as Partial<ModelNodeData>;
  const imageData = (selectedNode?.data || {}) as Partial<ImageModelNodeData>;
  const editorData = (selectedNode?.data || {}) as Partial<EditorNodeData>;

  // Extract data based on selected node - derive state from props instead of managing in state
  const duration = nodeData.duration || "5";
  const aspectRatio = nodeData.aspectRatio || "16:9";
  const resolution = (nodeData as Wan26NodeData).resolution || "720p";
  const randomSeed = !nodeData.seed;
  // Use a stable default seed value (0 means random will be used by the API)
  const seed = nodeData.seed || 0;
  const audioEnabled = (nodeData as Kling26NodeData).audioEnabled ?? true;
  const enhanceEnabled = (nodeData as Wan26NodeData).enhanceEnabled ?? false;
  const cfgScale = (nodeData as Kling26NodeData).cfgScale ?? 0.5;
  const specialFx = (nodeData as Kling25TurboNodeData).specialFx || "";
  const negativePrompt = nodeData.negativePrompt || "";

  // Video editor data
  const operation = editorData.operation || "trim";
  const transitionType = editorData.transition?.type || "fade";
  const transitionDuration = editorData.transition?.duration || 0.3;
  const editorAudioEnabled = editorData.audio?.enabled ?? true;
  const editorAudioVolume = editorData.audio?.volume ?? 1;
  const audioDucking = editorData.audio?.ducking ?? false;
  const subtitleStyle = editorData.subtitleStyle || "tiktok";
  const textPreset = editorData.textPreset || "title";
  const textPosition = editorData.textPosition || "bottom-center";
  const outputQuality = editorData.outputQuality || "high";
  const outputAspectRatio = editorData.outputAspectRatio || "9:16";
  const outputResolution = editorData.outputResolution || "1080p";

  // Nano Banana Pro data
  const imageMode = imageData.mode || "text-to-image";
  const imageAspectRatio = imageData.aspectRatio || "1:1";
  const imageResolution = imageData.resolution || "1K";
  const imageOutputFormat = imageData.outputFormat || "png";
  const numImages = imageData.numImages || 1;
  const enableWebSearch = imageData.enableWebSearch ?? false;
  const enableSafetyChecker = imageData.enableSafetyChecker ?? true;

  // If no configurable node is selected, show placeholder
  if (!config && !isVideoEditor && !isNanoBananaPro) {
    return (
      <aside className="flex h-full w-60 flex-col border-l border-zinc-800 bg-zinc-900">
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-center text-xs text-gray-500">
            Select a node to configure its parameters
          </p>
        </div>
      </aside>
    );
  }

  const handleUpdate = (key: string, value: unknown) => {
    if (selectedNode && onUpdateNode) {
      onUpdateNode(selectedNode.id, { [key]: value });
    }
  };

  const handleTransitionUpdate = (type: string, dur: number) => {
    if (selectedNode && onUpdateNode) {
      onUpdateNode(selectedNode.id, {
        transition: { type, duration: dur, easing: "easeInOut" },
      });
    }
  };

  const handleAudioUpdate = (
    enabled: boolean,
    volume: number,
    ducking: boolean
  ) => {
    if (selectedNode && onUpdateNode) {
      onUpdateNode(selectedNode.id, {
        audio: { enabled, volume, ducking },
      });
    }
  };

  // Render Video Editor panel
  if (isVideoEditor) {
    return (
      <aside className="flex h-full w-60 flex-col border-l border-zinc-800 bg-zinc-900">
        {/* Video Editor Header */}
        <div className="border-b border-zinc-800 px-3 py-2">
          <div className="flex items-center gap-2">
            <div
              className={`h-4 w-4 rounded bg-gradient-to-br ${VIDEO_EDITOR_CONFIG.color}`}
            />
            <span className="text-xs text-white">
              {VIDEO_EDITOR_CONFIG.name}
            </span>
          </div>
        </div>

        {/* Settings */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex flex-col gap-3">
            {/* Operation */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Operation</span>
                <span className="text-gray-500">
                  <InfoIcon />
                </span>
              </div>
              <select
                value={operation}
                onChange={(e) => {
                  handleUpdate("operation", e.target.value);
                }}
                className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white transition-colors hover:border-zinc-600"
              >
                {VIDEO_EDITOR_CONFIG.operations.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Transition Type */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Transition</span>
                <span className="text-gray-500">
                  <InfoIcon />
                </span>
              </div>
              <select
                value={transitionType}
                onChange={(e) => {
                  handleTransitionUpdate(e.target.value, transitionDuration);
                }}
                className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white transition-colors hover:border-zinc-600"
              >
                {VIDEO_EDITOR_CONFIG.transitions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Transition Duration */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">Duration</span>
                </div>
                <span className="text-xs text-gray-300">
                  {transitionDuration.toFixed(1)}s
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={transitionDuration}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  handleTransitionUpdate(transitionType, value);
                }}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Subtitle Style */}
            {(operation === "subtitles" || operation === "text") && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">Subtitle Style</span>
                  <span className="text-gray-500">
                    <InfoIcon />
                  </span>
                </div>
                <select
                  value={subtitleStyle}
                  onChange={(e) => {
                    handleUpdate("subtitleStyle", e.target.value);
                  }}
                  className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white transition-colors hover:border-zinc-600"
                >
                  {VIDEO_EDITOR_CONFIG.subtitleStyles.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Text Preset */}
            {operation === "text" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">Text Preset</span>
                    <span className="text-gray-500">
                      <InfoIcon />
                    </span>
                  </div>
                  <select
                    value={textPreset}
                    onChange={(e) => {
                      handleUpdate("textPreset", e.target.value);
                    }}
                    className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white transition-colors hover:border-zinc-600"
                  >
                    {VIDEO_EDITOR_CONFIG.textPresets.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">Text Position</span>
                    <span className="text-gray-500">
                      <InfoIcon />
                    </span>
                  </div>
                  <select
                    value={textPosition}
                    onChange={(e) => {
                      handleUpdate("textPosition", e.target.value);
                    }}
                    className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white transition-colors hover:border-zinc-600"
                  >
                    {VIDEO_EDITOR_CONFIG.textPositions.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Audio Settings */}
            {operation === "audio" && (
              <>
                <div className="flex items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-1.5">
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                        editorAudioEnabled
                          ? "border-cyan-500 bg-cyan-500 text-black"
                          : "border-zinc-600 bg-zinc-800"
                      }`}
                      onClick={() => {
                        const newValue = !editorAudioEnabled;
                        handleAudioUpdate(
                          newValue,
                          editorAudioVolume,
                          audioDucking
                        );
                      }}
                    >
                      {editorAudioEnabled && <CheckIcon />}
                    </div>
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">Enable Audio</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">Volume</span>
                    </div>
                    <span className="text-xs text-gray-300">
                      {Math.round(editorAudioVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={editorAudioVolume}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      handleAudioUpdate(
                        editorAudioEnabled,
                        value,
                        audioDucking
                      );
                    }}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-1.5">
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                        audioDucking
                          ? "border-cyan-500 bg-cyan-500 text-black"
                          : "border-zinc-600 bg-zinc-800"
                      }`}
                      onClick={() => {
                        const newValue = !audioDucking;
                        handleAudioUpdate(
                          editorAudioEnabled,
                          editorAudioVolume,
                          newValue
                        );
                      }}
                    >
                      {audioDucking && <CheckIcon />}
                    </div>
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">Audio Ducking</span>
                    <span className="text-gray-500">
                      <InfoIcon />
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Output Settings */}
            <div className="mt-2 border-t border-zinc-800 pt-3">
              <span className="mb-2 block text-[10px] font-medium tracking-wider text-gray-500 uppercase">
                Output
              </span>

              <div className="flex flex-col gap-3">
                {/* Quality */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-400">Quality</span>
                  <select
                    value={outputQuality}
                    onChange={(e) => {
                      handleUpdate("outputQuality", e.target.value);
                    }}
                    className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white transition-colors hover:border-zinc-600"
                  >
                    {VIDEO_EDITOR_CONFIG.qualities.map((q) => (
                      <option key={q.value} value={q.value}>
                        {q.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Aspect Ratio */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-400">Aspect Ratio</span>
                  <select
                    value={outputAspectRatio}
                    onChange={(e) => {
                      handleUpdate("outputAspectRatio", e.target.value);
                    }}
                    className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white transition-colors hover:border-zinc-600"
                  >
                    {VIDEO_EDITOR_CONFIG.aspectRatios.map((ar) => (
                      <option key={ar.value} value={ar.value}>
                        {ar.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resolution */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-400">Resolution</span>
                  <select
                    value={outputResolution}
                    onChange={(e) => {
                      handleUpdate("outputResolution", e.target.value);
                    }}
                    className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white transition-colors hover:border-zinc-600"
                  >
                    {VIDEO_EDITOR_CONFIG.resolutions.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Run button */}
        <div className="border-t border-zinc-800 p-3">
          <button className="flex w-full items-center justify-center gap-2 rounded-md bg-cyan-500 px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-cyan-400">
            <RunIcon />
            Process Video
          </button>
        </div>
      </aside>
    );
  }

  // Render Nano Banana Pro panel
  if (isNanoBananaPro) {
    return (
      <aside className="flex h-full w-60 flex-col border-l border-zinc-800 bg-zinc-900">
        {/* Nano Banana Pro Header */}
        <div className="border-b border-zinc-800 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`h-4 w-4 rounded bg-gradient-to-br ${NANO_BANANA_PRO_CONFIG.color}`}
              />
              <span className="text-xs text-white">
                {NANO_BANANA_PRO_CONFIG.name}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <CreditsIcon />
              <span className="text-xs">${NANO_BANANA_PRO_CONFIG.price}</span>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <div className="flex flex-col gap-3">
            {/* Mode */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Mode</span>
                <span className="text-gray-500">
                  <InfoIcon />
                </span>
              </div>
              <select
                value={imageMode}
                onChange={(e) => {
                  handleUpdate("mode", e.target.value);
                }}
                className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white transition-colors hover:border-zinc-600"
              >
                {NANO_BANANA_PRO_CONFIG.modes.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Aspect Ratio */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Aspect Ratio</span>
                <span className="text-gray-500">
                  <InfoIcon />
                </span>
              </div>
              <select
                value={imageAspectRatio}
                onChange={(e) => {
                  handleUpdate("aspectRatio", e.target.value);
                }}
                className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white transition-colors hover:border-zinc-600"
              >
                {NANO_BANANA_PRO_CONFIG.aspectRatios.map((ar) => (
                  <option key={ar.value} value={ar.value}>
                    {ar.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Resolution */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Resolution</span>
                <span className="text-gray-500">
                  <InfoIcon />
                </span>
              </div>
              <select
                value={imageResolution}
                onChange={(e) => {
                  handleUpdate("resolution", e.target.value);
                }}
                className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white transition-colors hover:border-zinc-600"
              >
                {NANO_BANANA_PRO_CONFIG.resolutions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Output Format */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Output Format</span>
                <span className="text-gray-500">
                  <InfoIcon />
                </span>
              </div>
              <select
                value={imageOutputFormat}
                onChange={(e) => {
                  handleUpdate("outputFormat", e.target.value);
                }}
                className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white transition-colors hover:border-zinc-600"
              >
                {NANO_BANANA_PRO_CONFIG.outputFormats.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Images */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">
                    Number of Images
                  </span>
                </div>
                <span className="text-xs text-gray-300">{numImages}</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                value={numImages}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  handleUpdate("numImages", value);
                }}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Web Search */}
            <div className="flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-1.5">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                    enableWebSearch
                      ? "border-cyan-500 bg-cyan-500 text-black"
                      : "border-zinc-600 bg-zinc-800"
                  }`}
                  onClick={() => {
                    const newValue = !enableWebSearch;
                    handleUpdate("enableWebSearch", newValue);
                  }}
                >
                  {enableWebSearch && <CheckIcon />}
                </div>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Enable Web Search</span>
                <span className="text-gray-500">
                  <InfoIcon />
                </span>
              </div>
            </div>

            {/* Safety Checker */}
            <div className="flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-1.5">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                    enableSafetyChecker
                      ? "border-cyan-500 bg-cyan-500 text-black"
                      : "border-zinc-600 bg-zinc-800"
                  }`}
                  onClick={() => {
                    const newValue = !enableSafetyChecker;
                    handleUpdate("enableSafetyChecker", newValue);
                  }}
                >
                  {enableSafetyChecker && <CheckIcon />}
                </div>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Safety Checker</span>
                <span className="text-gray-500">
                  <InfoIcon />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Run button */}
        <div className="border-t border-zinc-800 p-3">
          <button className="flex w-full items-center justify-center gap-2 rounded-md bg-cyan-500 px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-cyan-400">
            <RunIcon />
            Generate Image
          </button>
        </div>
      </aside>
    );
  }

  // Render Model node panel (existing code)
  return (
    <aside className="flex h-full w-60 flex-col border-l border-zinc-800 bg-zinc-900">
      {/* Model Header */}
      <div className="border-b border-zinc-800 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`h-4 w-4 rounded bg-gradient-to-br ${config!.color}`}
            />
            <span className="text-xs text-white">{config!.name}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <CreditsIcon />
            <span className="text-xs">${config!.price}</span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="flex flex-col gap-3">
          {/* Duration */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">Duration</span>
              <span className="text-gray-500">
                <InfoIcon />
              </span>
            </div>
            <select
              value={duration}
              onChange={(e) => {
                handleUpdate("duration", e.target.value);
              }}
              className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white transition-colors hover:border-zinc-600"
            >
              {config!.durations.map((d) => (
                <option key={d} value={d}>
                  {d}s
                </option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">Aspect Ratio</span>
              <span className="text-gray-500">
                <InfoIcon />
              </span>
            </div>
            <select
              value={aspectRatio}
              onChange={(e) => {
                handleUpdate("aspectRatio", e.target.value);
              }}
              className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white transition-colors hover:border-zinc-600"
            >
              {config!.aspectRatios.map((ar) => (
                <option key={ar} value={ar}>
                  {ar}
                </option>
              ))}
            </select>
          </div>

          {/* Resolution (Wan 2.6 only) */}
          {config!.resolutions && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Resolution</span>
                <span className="text-gray-500">
                  <InfoIcon />
                </span>
              </div>
              <select
                value={resolution}
                onChange={(e) => {
                  handleUpdate("resolution", e.target.value);
                }}
                className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white transition-colors hover:border-zinc-600"
              >
                {config!.resolutions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* CFG Scale (Kling models) */}
          {config &&
            "supportsCfgScale" in config &&
            config.supportsCfgScale && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">CFG Scale</span>
                    <span className="text-gray-500">
                      <InfoIcon />
                    </span>
                  </div>
                  <span className="text-xs text-gray-300">
                    {cfgScale.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={cfgScale}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    handleUpdate("cfgScale", value);
                  }}
                  className="w-full accent-cyan-500"
                />
              </div>
            )}

          {/* Special FX (Kling 2.5 Turbo only) */}
          {config &&
            "supportsSpecialFx" in config &&
            config.supportsSpecialFx && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">Special FX</span>
                  <span className="text-gray-500">
                    <InfoIcon />
                  </span>
                </div>
                <select
                  value={specialFx}
                  onChange={(e) => {
                    handleUpdate("specialFx", e.target.value);
                  }}
                  className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white transition-colors hover:border-zinc-600"
                >
                  {SPECIAL_FX_OPTIONS.map((fx) => (
                    <option key={fx.value} value={fx.value}>
                      {fx.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

          {/* Seed */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">Seed</span>
              <span className="text-gray-500">
                <InfoIcon />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-1.5">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                    randomSeed
                      ? "border-cyan-500 bg-cyan-500 text-black"
                      : "border-zinc-600 bg-zinc-800"
                  }`}
                  onClick={() => {
                    const newValue = !randomSeed;
                    if (newValue) {
                      handleUpdate("seed", undefined);
                    }
                  }}
                >
                  {randomSeed && <CheckIcon />}
                </div>
                <span className="text-xs text-gray-300">Random</span>
              </label>
              <input
                type="number"
                value={seed}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!randomSeed) {
                    handleUpdate("seed", value);
                  }
                }}
                disabled={randomSeed}
                className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-white disabled:opacity-50"
              />
            </div>
          </div>

          {/* Audio (Kling 2.6 only) */}
          {config && "supportsAudio" in config && config.supportsAudio && (
            <div className="flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-1.5">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                    audioEnabled
                      ? "border-cyan-500 bg-cyan-500 text-black"
                      : "border-zinc-600 bg-zinc-800"
                  }`}
                  onClick={() => {
                    const newValue = !audioEnabled;
                    handleUpdate("audioEnabled", newValue);
                  }}
                >
                  {audioEnabled && <CheckIcon />}
                </div>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Enable Audio</span>
                <span className="text-gray-500">
                  <InfoIcon />
                </span>
              </div>
            </div>
          )}

          {/* Prompt Enhancement (Wan 2.6 only) */}
          {config &&
            "supportsPromptEnhancement" in config &&
            config.supportsPromptEnhancement && (
              <div className="flex items-center gap-2">
                <label className="flex cursor-pointer items-center gap-1.5">
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                      enhanceEnabled
                        ? "border-cyan-500 bg-cyan-500 text-black"
                        : "border-zinc-600 bg-zinc-800"
                    }`}
                    onClick={() => {
                      const newValue = !enhanceEnabled;
                      handleUpdate("enhanceEnabled", newValue);
                    }}
                  >
                    {enhanceEnabled && <CheckIcon />}
                  </div>
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">
                    Prompt Expansion
                  </span>
                  <span className="text-gray-500">
                    <InfoIcon />
                  </span>
                </div>
              </div>
            )}

          {/* Negative Prompt */}
          {config &&
            "supportsNegativePrompt" in config &&
            config.supportsNegativePrompt && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">Negative Prompt</span>
                  <span className="text-gray-500">
                    <InfoIcon />
                  </span>
                </div>
                <textarea
                  value={negativePrompt}
                  onChange={(e) => {
                    handleUpdate("negativePrompt", e.target.value);
                  }}
                  placeholder="Things to avoid..."
                  className="h-16 w-full resize-none rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-white placeholder-gray-500"
                />
              </div>
            )}
        </div>
      </div>

      {/* Run button */}
      <div className="border-t border-zinc-800 p-3">
        <button className="flex w-full items-center justify-center gap-2 rounded-md bg-cyan-500 px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-cyan-400">
          <RunIcon />
          Run selected
        </button>
      </div>
    </aside>
  );
}
