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

// Model-specific node data types
export interface Kling26NodeData extends BaseNodeData {
  videoUrl?: string;
  mode?: "text-to-video" | "image-to-video";
  duration?: "5" | "10";
  aspectRatio?: "1:1" | "16:9" | "9:16";
  audioEnabled?: boolean;
  cfgScale?: number;
  negativePrompt?: string;
  seed?: number;
}

export interface Kling25TurboNodeData extends BaseNodeData {
  videoUrl?: string;
  mode?: "text-to-video" | "image-to-video";
  duration?: "5" | "10";
  aspectRatio?: "1:1" | "16:9" | "9:16";
  cfgScale?: number;
  negativePrompt?: string;
  specialFx?: string;
  seed?: number;
}

export interface Wan26NodeData extends BaseNodeData {
  videoUrl?: string;
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
}

// Video Editor node data type
export interface VideoEditorNodeData extends BaseNodeData {
  videoUrl?: string;
  operation?:
    | "trim"
    | "concatenate"
    | "transition"
    | "audio"
    | "subtitles"
    | "text";
  // Trim settings
  trimStart?: number;
  trimEnd?: number;
  // Transition settings
  transition?: {
    type:
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
    duration: number;
    easing?: "linear" | "easeIn" | "easeOut" | "easeInOut";
  };
  // Audio settings
  audio?: {
    enabled: boolean;
    volume: number;
    fadeIn?: number;
    fadeOut?: number;
    ducking?: boolean;
  };
  // Subtitle settings
  subtitleStyle?:
    | "classic"
    | "tiktok"
    | "highlight"
    | "minimal"
    | "neon"
    | "karaoke";
  // Text overlay settings
  textPreset?: "title" | "hook" | "cta" | "lowerThird";
  textPosition?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "center-left"
    | "center"
    | "center-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  // Output settings
  outputQuality?: "draft" | "normal" | "high" | "best";
  outputAspectRatio?: "9:16" | "16:9" | "1:1" | "4:5";
  outputResolution?: "720p" | "1080p" | "4k";
}

// Union type for all node data
export type WorkflowNodeData =
  | ImageInputNodeData
  | PromptNodeData
  | ModelNodeData
  | OutputNodeData
  | PreviewNodeData
  | VideoNodeData
  | Kling26NodeData
  | Kling25TurboNodeData
  | Wan26NodeData
  | NanoBananaProNodeData
  | VideoEditorNodeData;

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
  | "kling26"
  | "kling25Turbo"
  | "wan26"
  | "nanoBananaPro"
  | "videoEditor";

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
