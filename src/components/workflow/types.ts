import type { Node, Edge } from "@xyflow/react";

// Base node data with common fields
export interface BaseNodeData extends Record<string, unknown> {
  label: string;
}

// Extended node data types
export interface ImageInputNodeData extends BaseNodeData {
  imageUrl?: string;
}

export interface PromptNodeData extends BaseNodeData {
  prompt: string;
}

export interface ModelNodeData extends BaseNodeData {
  modelId: string;
  modelName: string;
}

export interface OutputNodeData extends BaseNodeData {
  outputUrl?: string;
}

export interface PreviewNodeData extends BaseNodeData {
  previewUrl?: string;
}

export interface VideoNodeData extends BaseNodeData {
  videoUrl?: string;
  fileName?: string;
}

export interface FileNodeData extends BaseNodeData {
  fileType?: "image" | "video";
  imageUrl?: string;
  videoUrl?: string;
  fileName?: string;
  aspectRatio?: string;
}

// Model-specific node data types
export interface Kling26NodeData extends BaseNodeData {
  prompt?: string;
  videoUrl?: string;
  isGenerating?: boolean;
  mode?: "text-to-video" | "image-to-video";
  duration?: "5" | "10";
  aspectRatio?: "1:1" | "16:9" | "9:16";
  audioEnabled?: boolean;
  cfgScale?: number;
  negativePrompt?: string;
  seed?: number;
}

export interface Kling25TurboNodeData extends BaseNodeData {
  prompt?: string;
  videoUrl?: string;
  isGenerating?: boolean;
  mode?: "text-to-video" | "image-to-video";
  duration?: "5" | "10";
  aspectRatio?: "1:1" | "16:9" | "9:16";
  cfgScale?: number;
  negativePrompt?: string;
  specialFx?: string;
  seed?: number;
}

export interface Wan26NodeData extends BaseNodeData {
  prompt?: string;
  videoUrl?: string;
  isGenerating?: boolean;
  mode?: "text-to-video" | "image-to-video" | "reference-to-video";
  duration?: "5" | "10" | "15";
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  resolution?: "720p" | "1080p";
  enhanceEnabled?: boolean;
  negativePrompt?: string;
  seed?: number;
}

// Nano Banana Pro (Image Generation) node data type
export interface NanoBananaProNodeData extends BaseNodeData {
  prompt?: string;
  imageUrl?: string;
  isGenerating?: boolean;
  mode?: "text-to-image" | "image-edit";
  aspectRatio?:
    | "1:1"
    | "16:9"
    | "9:16"
    | "4:3"
    | "3:4"
    | "3:2"
    | "2:3"
    | "21:9"
    | "5:4"
    | "4:5";
  resolution?: "1K" | "2K" | "4K";
  outputFormat?: "png" | "jpeg" | "webp";
  numImages?: number;
  enableWebSearch?: boolean;
  enableSafetyChecker?: boolean;
  // Number of reference image inputs (5-14, default 5)
  inputCount?: number;
  // Selected character and product for reference images
  characterId?: string;
  productId?: string;
}

// Video Concat node data type
export type TransitionType =
  | "none"
  | "fade"
  | "crossfade"
  | "slideLeft"
  | "slideRight"
  | "slideUp"
  | "slideDown"
  | "zoomIn"
  | "zoomOut"
  | "wipeLeft"
  | "wipeRight"
  | "blur"
  | "glitch"
  | "flash";

export interface VideoConcatNodeData extends BaseNodeData {
  videoUrl?: string;
  isGenerating?: boolean;
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:5";
  // Array of transitions between clips (length = number of clips - 1)
  transitions?: { type: TransitionType; duration: number }[];
  // Number of video inputs (5-10, default 5)
  inputCount?: number;
}

// Video Subtitles node data type
export interface VideoSubtitlesNodeData extends BaseNodeData {
  videoUrl?: string;
  isGenerating?: boolean;
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:5";
  style?: "classic" | "tiktok" | "highlight" | "minimal" | "neon" | "karaoke";
  position?: "top" | "center" | "bottom";
  autoGenerate?: boolean;
  transcript?: string;
}

// Video Trim node data type
export interface VideoTrimNodeData extends BaseNodeData {
  videoUrl?: string;
  isGenerating?: boolean;
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:5";
  startTime?: number;
  endTime?: number;
}

// Video Transition node data type
export interface VideoTransitionNodeData extends BaseNodeData {
  videoUrl?: string;
  isGenerating?: boolean;
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:5";
  transitionType?:
    | "none"
    | "fade"
    | "crossfade"
    | "slideLeft"
    | "slideRight"
    | "slideUp"
    | "slideDown"
    | "zoomIn"
    | "zoomOut"
    | "wipeLeft"
    | "wipeRight"
    | "blur"
    | "glitch"
    | "flash";
  duration?: number;
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut";
}

// Union type for all node data
export type WorkflowNodeData =
  | ImageInputNodeData
  | PromptNodeData
  | ModelNodeData
  | OutputNodeData
  | PreviewNodeData
  | VideoNodeData
  | FileNodeData
  | Kling26NodeData
  | Kling25TurboNodeData
  | Wan26NodeData
  | NanoBananaProNodeData
  | VideoConcatNodeData
  | VideoSubtitlesNodeData
  | VideoTrimNodeData
  | VideoTransitionNodeData;

// Generic workflow node type
export type WorkflowNode = Node<WorkflowNodeData, string>;

// Typed workflow edge
export type WorkflowEdge = Edge;

// Node types available in the workflow
export type NodeType =
  | "imageInput"
  | "prompt"
  | "model"
  | "output"
  | "preview"
  | "video"
  | "file"
  | "kling26"
  | "kling25Turbo"
  | "wan26"
  | "nanoBananaPro"
  | "videoConcat"
  | "videoSubtitles"
  | "videoTrim"
  | "videoTransition";

// Sidebar node item for drag and drop
export interface SidebarNodeItem {
  type: NodeType;
  label: string;
  description: string;
  icon: string;
}

// Workflow state
export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNode: string | null;
}

// Preview state for Konva
export interface PreviewState {
  imageUrl: string | null;
  isLoading: boolean;
}
