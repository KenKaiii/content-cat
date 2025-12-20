"use client";

import { useCallback, useState, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import type { Node, Edge } from "@xyflow/react";
import { apiFetch } from "@/lib/csrf";
import type {
  WorkflowNodeData,
  PromptNodeData,
  FileNodeData,
  ImageInputNodeData,
  NanoBananaProNodeData,
  Kling26NodeData,
  Kling25TurboNodeData,
  Wan26NodeData,
  VideoConcatNodeData,
  VideoSubtitlesNodeData,
  VideoTrimNodeData,
  VideoTransitionNodeData,
} from "@/components/workflow/types";

// Image compression constants (matching image-compression.ts)
const MAX_BASE64_SIZE = 4 * 1024 * 1024; // 4MB target for base64
const MAX_IMAGE_DIMENSION = 2048; // Max pixels on longest side

/**
 * Compress an image loaded in an HTMLImageElement
 */
function compressImageElement(img: HTMLImageElement): string {
  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  // Resize if larger than max dimension
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height / width) * MAX_IMAGE_DIMENSION);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width / height) * MAX_IMAGE_DIMENSION);
      height = MAX_IMAGE_DIMENSION;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }
  ctx.drawImage(img, 0, 0, width, height);

  // Try progressively lower quality until under size limit
  const qualities = [0.92, 0.85, 0.75, 0.65, 0.5, 0.4, 0.3];
  for (const quality of qualities) {
    const base64 = canvas.toDataURL("image/jpeg", quality);
    if (base64.length <= MAX_BASE64_SIZE) {
      return base64;
    }
  }

  // Last resort: return lowest quality
  return canvas.toDataURL("image/jpeg", 0.3);
}

/**
 * Convert a local file URL to a compressed base64 data URL
 * Local URLs like /api/files/... are not accessible by external services like fal.ai
 * Images are compressed to under 4MB for fal.ai compatibility
 */
async function convertToDataUrl(url: string): Promise<string> {
  // If it's an external URL, we can't compress it client-side, return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // If it's already a data URL, check if it needs compression
  if (url.startsWith("data:")) {
    if (url.length <= MAX_BASE64_SIZE) {
      return url;
    }
    // Need to compress the data URL
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          resolve(compressImageElement(img));
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () =>
        reject(new Error("Failed to load image for compression"));
      img.src = url;
    });
  }

  // It's a local URL, fetch, load as image, and compress
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        try {
          const compressed = compressImageElement(img);
          console.log(
            "[Execution] Compressed image size:",
            Math.round(compressed.length / 1024),
            "KB"
          );
          resolve(compressed);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load image for compression"));
      };
      img.src = objectUrl;
    });
  } catch (error) {
    console.error("[Execution] Failed to convert URL to data URL:", error);
    throw error;
  }
}

interface ConnectedInput {
  nodeId: string;
  nodeType: string;
  handleType: string;
  targetHandle: string; // The input handle ID on the target node (e.g., "video1", "video2")
  data: WorkflowNodeData;
}

interface ExecutionResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

interface ExecutionState {
  isExecuting: boolean;
  executingNodeId: string | null;
  executingNodeIds: string[]; // For tracking multiple executing nodes
  error: string | null;
}

// Node types that can be executed
const EXECUTABLE_NODE_TYPES = new Set([
  "nanoBananaPro",
  "kling26",
  "kling25Turbo",
  "wan26",
  "videoConcat",
  "videoSubtitles",
  "videoTrim",
  "videoTransition",
]);

export function useWorkflowExecution() {
  const { getNodes, getEdges, setNodes } = useReactFlow();
  const [state, setState] = useState<ExecutionState>({
    isExecuting: false,
    executingNodeId: null,
    executingNodeIds: [],
    error: null,
  });

  // Ref to track abort status for stopping execution
  const abortRef = useRef(false);

  /**
   * Get all nodes connected to a target node's input handles
   */
  const getConnectedInputs = useCallback(
    (nodeId: string): ConnectedInput[] => {
      const edges = getEdges();
      const nodes = getNodes();

      // Find all edges that target this node
      const incomingEdges = edges.filter((edge) => edge.target === nodeId);

      return incomingEdges
        .map((edge) => {
          const sourceNode = nodes.find((n) => n.id === edge.source);
          if (!sourceNode) return null;

          return {
            nodeId: sourceNode.id,
            nodeType: sourceNode.type || "unknown",
            handleType: edge.sourceHandle || "default",
            targetHandle: edge.targetHandle || "default",
            data: sourceNode.data as WorkflowNodeData,
          };
        })
        .filter((input): input is ConnectedInput => input !== null);
    },
    [getEdges, getNodes]
  );

  /**
   * Extract prompt text from connected prompt/file nodes
   */
  const extractPrompt = useCallback(
    (inputs: ConnectedInput[]): string | undefined => {
      // First check for direct prompt connections
      const promptInput = inputs.find(
        (input) => input.handleType === "prompt" || input.nodeType === "prompt"
      );

      if (promptInput) {
        const data = promptInput.data as PromptNodeData;
        return data.prompt;
      }

      return undefined;
    },
    []
  );

  /**
   * Extract image URL from connected file/image nodes or result outputs
   */
  const extractImageUrl = useCallback(
    (inputs: ConnectedInput[]): string | undefined => {
      // Check for image handle connections or result outputs from generation nodes
      const imageInput = inputs.find(
        (input) =>
          input.handleType === "image" ||
          input.handleType === "result" ||
          input.nodeType === "imageInput" ||
          input.nodeType === "file" ||
          input.nodeType === "nanoBananaPro"
      );

      if (imageInput) {
        if (imageInput.nodeType === "file") {
          const data = imageInput.data as FileNodeData;
          return data.imageUrl;
        }
        if (imageInput.nodeType === "imageInput") {
          const data = imageInput.data as ImageInputNodeData;
          return data.imageUrl;
        }
        if (imageInput.nodeType === "nanoBananaPro") {
          const data = imageInput.data as NanoBananaProNodeData;
          return data.imageUrl;
        }
        // For other node types that might have imageUrl
        const data = imageInput.data as { imageUrl?: string };
        return data.imageUrl;
      }

      return undefined;
    },
    []
  );

  /**
   * Extract video URL from connected file/video nodes or result outputs
   */
  const extractVideoUrl = useCallback(
    (inputs: ConnectedInput[]): string | undefined => {
      const videoInput = inputs.find(
        (input) =>
          input.handleType === "video" ||
          input.handleType === "result" ||
          input.nodeType === "video" ||
          input.nodeType === "kling26" ||
          input.nodeType === "kling25Turbo" ||
          input.nodeType === "wan26" ||
          (input.nodeType === "file" &&
            (input.data as FileNodeData).fileType === "video")
      );

      if (videoInput) {
        if (videoInput.nodeType === "file") {
          const data = videoInput.data as FileNodeData;
          return data.videoUrl;
        }
        if (
          videoInput.nodeType === "kling26" ||
          videoInput.nodeType === "kling25Turbo" ||
          videoInput.nodeType === "wan26"
        ) {
          const data = videoInput.data as { videoUrl?: string };
          return data.videoUrl;
        }
        const data = videoInput.data as { videoUrl?: string };
        return data.videoUrl;
      }

      return undefined;
    },
    []
  );

  /**
   * Update a node's data after execution
   */
  const updateNodeData = useCallback(
    (nodeId: string, updates: Partial<WorkflowNodeData>) => {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...updates } }
            : node
        )
      );
    },
    [setNodes]
  );

  /**
   * Fetch character reference images by ID
   */
  const fetchCharacterImages = useCallback(
    async (characterId: string): Promise<string[]> => {
      try {
        const response = await fetch(`/api/characters/${characterId}`);
        if (response.ok) {
          const character = await response.json();
          return character.referenceImages || [];
        }
      } catch (error) {
        console.error("[Execution] Failed to fetch character:", error);
      }
      return [];
    },
    []
  );

  /**
   * Fetch product reference images by ID
   */
  const fetchProductImages = useCallback(
    async (productId: string): Promise<string[]> => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const product = await response.json();
          return product.referenceImages || [];
        }
      } catch (error) {
        console.error("[Execution] Failed to fetch product:", error);
      }
      return [];
    },
    []
  );

  /**
   * Execute NanoBananaPro (image generation) node
   */
  const executeNanoBananaPro = useCallback(
    async (
      nodeId: string,
      nodeData: NanoBananaProNodeData,
      inputs: ConnectedInput[]
    ): Promise<ExecutionResult> => {
      // Debug logging
      console.log("[Execution] NanoBananaPro inputs:", inputs);
      console.log("[Execution] Node data:", nodeData);

      const prompt = extractPrompt(inputs) || nodeData.prompt;
      let imageUrl = extractImageUrl(inputs);

      console.log("[Execution] Extracted prompt:", prompt);
      console.log("[Execution] Extracted imageUrl:", imageUrl);

      if (!prompt) {
        return {
          success: false,
          error: "No prompt provided. Connect a Prompt node or enter a prompt.",
        };
      }

      // Collect all reference image URLs
      const allImageUrls: string[] = [];

      // Fetch character reference images if a character is selected
      if (nodeData.characterId) {
        console.log("[Execution] Fetching character images for:", nodeData.characterId);
        const charImages = await fetchCharacterImages(nodeData.characterId);
        console.log("[Execution] Character images:", charImages.length);
        allImageUrls.push(...charImages);
      }

      // Fetch product reference images if a product is selected
      if (nodeData.productId) {
        console.log("[Execution] Fetching product images for:", nodeData.productId);
        const prodImages = await fetchProductImages(nodeData.productId);
        console.log("[Execution] Product images:", prodImages.length);
        allImageUrls.push(...prodImages);
      }

      // Convert local file URLs to data URLs for fal.ai
      if (imageUrl) {
        try {
          imageUrl = await convertToDataUrl(imageUrl);
          console.log(
            "[Execution] Converted imageUrl to data URL (length):",
            imageUrl.length
          );
          allImageUrls.push(imageUrl);
        } catch {
          return { success: false, error: "Failed to process reference image" };
        }
      }

      // Set generating state
      updateNodeData(nodeId, { isGenerating: true });

      const payload = {
        prompt,
        aspectRatio: nodeData.aspectRatio || "1:1",
        resolution: nodeData.resolution || "1K",
        outputFormat: nodeData.outputFormat || "png",
        numImages: nodeData.numImages || 1,
        enableWebSearch: nodeData.enableWebSearch || false,
        enableSafetyChecker: nodeData.enableSafetyChecker ?? true,
        imageUrls: allImageUrls.length > 0 ? allImageUrls : undefined,
      };

      try {
        const response = await apiFetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          timeout: 120000, // 2 minutes for image generation
        });

        const result = await response.json();

        if (!response.ok) {
          updateNodeData(nodeId, { isGenerating: false });
          return {
            success: false,
            error: result.error || "Image generation failed",
          };
        }

        // Update node with generated image
        const generatedImageUrl =
          result.resultUrls?.[0] || result.images?.[0]?.url;
        updateNodeData(nodeId, {
          imageUrl: generatedImageUrl || nodeData.imageUrl,
          isGenerating: false,
        });

        // Save the generated image to the database so it appears in assets
        if (generatedImageUrl) {
          try {
            await apiFetch("/api/images", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                url: generatedImageUrl,
                prompt,
                aspectRatio: nodeData.aspectRatio || "1:1",
              }),
            });
          } catch (saveError) {
            console.error("[Execution] Failed to save image to database:", saveError);
            // Don't fail the execution if saving fails - the image was still generated
          }
        }

        return { success: true, data: result };
      } catch {
        updateNodeData(nodeId, { isGenerating: false });
        throw new Error("Image generation failed");
      }
    },
    [extractPrompt, extractImageUrl, updateNodeData, fetchCharacterImages, fetchProductImages]
  );

  /**
   * Execute Kling 2.6 (video generation) node
   */
  const executeKling26 = useCallback(
    async (
      nodeId: string,
      nodeData: Kling26NodeData,
      inputs: ConnectedInput[]
    ): Promise<ExecutionResult> => {
      const prompt = extractPrompt(inputs);
      let imageUrl = extractImageUrl(inputs);

      if (!prompt) {
        return {
          success: false,
          error: "No prompt provided. Connect a Prompt node.",
        };
      }

      // Convert local file URLs to data URLs for fal.ai
      if (imageUrl) {
        try {
          imageUrl = await convertToDataUrl(imageUrl);
        } catch {
          return { success: false, error: "Failed to process reference image" };
        }
      }

      // Determine mode based on whether image is connected
      const mode = imageUrl
        ? "image-to-video"
        : nodeData.mode || "text-to-video";

      // Set generating state
      updateNodeData(nodeId, { isGenerating: true });

      const payload = {
        prompt,
        model: "kling-2.6",
        mode,
        aspectRatio: nodeData.aspectRatio || "16:9",
        duration: nodeData.duration || "5",
        audioEnabled: nodeData.audioEnabled ?? false,
        cfgScale: nodeData.cfgScale ?? 0.5,
        negativePrompt: nodeData.negativePrompt,
        seed: nodeData.seed,
        imageUrl: imageUrl,
      };

      try {
        const response = await apiFetch("/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          timeout: 300000, // 5 minutes for video generation
        });

        const result = await response.json();

        if (!response.ok) {
          updateNodeData(nodeId, { isGenerating: false });
          return {
            success: false,
            error: result.error || "Video generation failed",
          };
        }

        // Update node with generated video
        updateNodeData(nodeId, {
          videoUrl: result.videoUrl || nodeData.videoUrl,
          isGenerating: false,
        });

        return { success: true, data: result };
      } catch {
        updateNodeData(nodeId, { isGenerating: false });
        throw new Error("Kling 2.6 video generation failed");
      }
    },
    [extractPrompt, extractImageUrl, updateNodeData]
  );

  /**
   * Execute Kling 2.5 Turbo (video generation) node
   */
  const executeKling25Turbo = useCallback(
    async (
      nodeId: string,
      nodeData: Kling25TurboNodeData,
      inputs: ConnectedInput[]
    ): Promise<ExecutionResult> => {
      const prompt = extractPrompt(inputs);

      // Extract first frame image (from firstFrame handle or legacy image handle)
      const firstFrameInput = inputs.find(
        (input) =>
          input.targetHandle === "firstFrame" ||
          input.targetHandle === "image" ||
          (input.handleType === "image" && input.targetHandle !== "lastFrame")
      );
      let imageUrl: string | undefined;
      if (firstFrameInput) {
        const data = firstFrameInput.data as { imageUrl?: string };
        imageUrl = data.imageUrl;
      }

      // Extract last frame image (from lastFrame handle)
      const lastFrameInput = inputs.find(
        (input) => input.targetHandle === "lastFrame"
      );
      let endImageUrl: string | undefined;
      if (lastFrameInput) {
        const data = lastFrameInput.data as { imageUrl?: string };
        endImageUrl = data.imageUrl;
      }

      if (!prompt) {
        return {
          success: false,
          error: "No prompt provided. Connect a Prompt node.",
        };
      }

      // Convert local file URLs to data URLs for fal.ai
      if (imageUrl) {
        try {
          imageUrl = await convertToDataUrl(imageUrl);
        } catch {
          return {
            success: false,
            error: "Failed to process first frame image",
          };
        }
      }

      if (endImageUrl) {
        try {
          endImageUrl = await convertToDataUrl(endImageUrl);
        } catch {
          return {
            success: false,
            error: "Failed to process last frame image",
          };
        }
      }

      const mode = imageUrl
        ? "image-to-video"
        : nodeData.mode || "text-to-video";

      // Set generating state
      updateNodeData(nodeId, { isGenerating: true });

      const payload = {
        prompt,
        model: "kling-2.5-turbo",
        mode,
        aspectRatio: nodeData.aspectRatio || "16:9",
        duration: nodeData.duration || "5",
        cfgScale: nodeData.cfgScale ?? 0.5,
        negativePrompt: nodeData.negativePrompt,
        specialFx: nodeData.specialFx || undefined,
        seed: nodeData.seed,
        imageUrl: imageUrl,
        endImageUrl: endImageUrl,
      };

      try {
        const response = await apiFetch("/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          timeout: 300000, // 5 minutes for video generation
        });

        const result = await response.json();

        if (!response.ok) {
          updateNodeData(nodeId, { isGenerating: false });
          return {
            success: false,
            error: result.error || "Video generation failed",
          };
        }

        updateNodeData(nodeId, {
          videoUrl: result.videoUrl || nodeData.videoUrl,
          isGenerating: false,
        });

        return { success: true, data: result };
      } catch {
        updateNodeData(nodeId, { isGenerating: false });
        throw new Error("Kling 2.5 Turbo video generation failed");
      }
    },
    [extractPrompt, updateNodeData]
  );

  /**
   * Execute Wan 2.6 (video generation) node
   */
  const executeWan26 = useCallback(
    async (
      nodeId: string,
      nodeData: Wan26NodeData,
      inputs: ConnectedInput[]
    ): Promise<ExecutionResult> => {
      const prompt = extractPrompt(inputs);
      let imageUrl = extractImageUrl(inputs);

      if (!prompt) {
        return {
          success: false,
          error: "No prompt provided. Connect a Prompt node.",
        };
      }

      // Convert local file URLs to data URLs for fal.ai
      if (imageUrl) {
        try {
          imageUrl = await convertToDataUrl(imageUrl);
        } catch {
          return { success: false, error: "Failed to process reference image" };
        }
      }

      const mode = imageUrl
        ? "image-to-video"
        : nodeData.mode || "text-to-video";

      // Set generating state
      updateNodeData(nodeId, { isGenerating: true });

      const payload = {
        prompt,
        model: "wan-2.6",
        mode,
        aspectRatio: nodeData.aspectRatio || "16:9",
        duration: nodeData.duration || "5",
        resolution: nodeData.resolution || "720p",
        enhanceEnabled: nodeData.enhanceEnabled ?? false,
        negativePrompt: nodeData.negativePrompt,
        seed: nodeData.seed,
        imageUrl: imageUrl,
      };

      try {
        const response = await apiFetch("/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          timeout: 300000, // 5 minutes for video generation
        });

        const result = await response.json();

        if (!response.ok) {
          updateNodeData(nodeId, { isGenerating: false });
          return {
            success: false,
            error: result.error || "Video generation failed",
          };
        }

        updateNodeData(nodeId, {
          videoUrl: result.videoUrl || nodeData.videoUrl,
          isGenerating: false,
        });

        return { success: true, data: result };
      } catch {
        updateNodeData(nodeId, { isGenerating: false });
        throw new Error("Wan 2.6 video generation failed");
      }
    },
    [extractPrompt, extractImageUrl, updateNodeData]
  );

  /**
   * Execute Video Concat node - concatenates multiple video inputs using FFmpeg
   */
  const executeVideoConcat = useCallback(
    async (
      nodeId: string,
      nodeData: VideoConcatNodeData,
      inputs: ConnectedInput[]
    ): Promise<ExecutionResult> => {
      // Collect all video inputs with their URLs and metadata
      const videoInputs = inputs
        .filter(
          (input) =>
            input.handleType === "video" ||
            input.nodeType === "kling26" ||
            input.nodeType === "kling25Turbo" ||
            input.nodeType === "wan26" ||
            input.nodeType === "videoConcat" ||
            input.nodeType === "videoTrim" ||
            input.nodeType === "videoTransition" ||
            input.nodeType === "videoSubtitles" ||
            (input.nodeType === "file" &&
              (input.data as FileNodeData).fileType === "video")
        )
        // Sort by target handle to maintain correct order (video1, video2, video3, etc.)
        .sort((a, b) => {
          // Extract numeric part from handle IDs like "video1", "video2", etc.
          const getHandleOrder = (handle: string): number => {
            const match = handle.match(/(\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
          };
          return (
            getHandleOrder(a.targetHandle) - getHandleOrder(b.targetHandle)
          );
        });

      const videoUrls = videoInputs
        .map((input) => {
          const data = input.data as { videoUrl?: string };
          return data.videoUrl;
        })
        .filter((url): url is string => !!url);

      if (videoUrls.length === 0) {
        return {
          success: false,
          error: "No videos connected. Connect at least one video source.",
        };
      }

      // Detect aspect ratio from first connected source
      let detectedAspectRatio: VideoConcatNodeData["aspectRatio"] =
        nodeData.aspectRatio || "16:9";
      if (videoInputs.length > 0) {
        const firstInputData = videoInputs[0].data as {
          aspectRatio?: VideoConcatNodeData["aspectRatio"];
        };
        if (firstInputData.aspectRatio) {
          detectedAspectRatio = firstInputData.aspectRatio;
        }
      }

      // Set generating state
      updateNodeData(nodeId, { isGenerating: true });

      try {
        // Build transitions array - one transition per pair of videos
        const defaultTransition = { type: "none" as const, duration: 0 };
        const transitions = nodeData.transitions || [];
        const transitionsToSend =
          videoUrls.length > 1
            ? Array.from(
                { length: videoUrls.length - 1 },
                (_, i) => transitions[i] || defaultTransition
              )
            : [];

        // Call the video editing API
        const response = await apiFetch("/api/video-edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "concat",
            videoUrls,
            transitions: transitionsToSend,
            aspectRatio: detectedAspectRatio,
          }),
          timeout: 600000, // 10 minutes for video processing
        });

        const result = await response.json();

        if (!response.ok) {
          updateNodeData(nodeId, { isGenerating: false });
          return {
            success: false,
            error: result.error || "Video concatenation failed",
          };
        }

        // Update node with processed video
        updateNodeData(nodeId, {
          videoUrl: result.videoUrl,
          aspectRatio: detectedAspectRatio,
          isGenerating: false,
        });

        return {
          success: true,
          data: {
            message: `Video concat completed (${videoUrls.length} videos)`,
            videoUrl: result.videoUrl,
            aspectRatio: detectedAspectRatio,
          },
        };
      } catch {
        updateNodeData(nodeId, { isGenerating: false });
        throw new Error("Video concatenation failed");
      }
    },
    [updateNodeData]
  );

  /**
   * Execute Video Subtitles node - adds subtitles to video
   * Note: Full implementation requires transcription service integration
   */
  const executeVideoSubtitles = useCallback(
    async (
      nodeId: string,
      nodeData: VideoSubtitlesNodeData,
      inputs: ConnectedInput[]
    ): Promise<ExecutionResult> => {
      const videoUrl = extractVideoUrl(inputs);

      if (!videoUrl) {
        return {
          success: false,
          error: "No video connected. Connect a video source.",
        };
      }

      // Detect aspect ratio from connected source
      const videoInput = inputs.find(
        (input) =>
          input.handleType === "video" ||
          input.nodeType === "kling26" ||
          input.nodeType === "kling25Turbo" ||
          input.nodeType === "wan26" ||
          input.nodeType === "videoConcat" ||
          input.nodeType === "videoTrim" ||
          input.nodeType === "videoTransition" ||
          input.nodeType === "videoSubtitles"
      );
      let detectedAspectRatio: VideoSubtitlesNodeData["aspectRatio"] =
        nodeData.aspectRatio || "9:16";
      if (videoInput) {
        const inputData = videoInput.data as {
          aspectRatio?: VideoSubtitlesNodeData["aspectRatio"];
        };
        if (inputData.aspectRatio) {
          detectedAspectRatio = inputData.aspectRatio;
        }
      }

      // Set generating state
      updateNodeData(nodeId, { isGenerating: true });

      // TODO: Implement actual subtitles API with transcription service
      // For now, pass through the video with updated aspect ratio
      updateNodeData(nodeId, {
        videoUrl,
        aspectRatio: detectedAspectRatio,
        isGenerating: false,
      });

      return {
        success: true,
        data: {
          message: "Subtitles pass-through (transcription service needed)",
          videoUrl,
          aspectRatio: detectedAspectRatio,
        },
      };
    },
    [extractVideoUrl, updateNodeData]
  );

  /**
   * Execute Video Trim node - trims video to specified time range using FFmpeg
   */
  const executeVideoTrim = useCallback(
    async (
      nodeId: string,
      nodeData: VideoTrimNodeData,
      inputs: ConnectedInput[]
    ): Promise<ExecutionResult> => {
      const videoUrl = extractVideoUrl(inputs);

      if (!videoUrl) {
        return {
          success: false,
          error: "No video connected. Connect a video source.",
        };
      }

      // Detect aspect ratio from connected source
      const videoInput = inputs.find(
        (input) =>
          input.handleType === "video" ||
          input.nodeType === "kling26" ||
          input.nodeType === "kling25Turbo" ||
          input.nodeType === "wan26" ||
          input.nodeType === "videoConcat" ||
          input.nodeType === "videoTrim" ||
          input.nodeType === "videoTransition" ||
          input.nodeType === "videoSubtitles"
      );
      let detectedAspectRatio: VideoTrimNodeData["aspectRatio"] =
        nodeData.aspectRatio || "16:9";
      if (videoInput) {
        const inputData = videoInput.data as {
          aspectRatio?: VideoTrimNodeData["aspectRatio"];
        };
        if (inputData.aspectRatio) {
          detectedAspectRatio = inputData.aspectRatio;
        }
      }

      // Set generating state
      updateNodeData(nodeId, { isGenerating: true });

      try {
        // Call the video editing API
        const response = await apiFetch("/api/video-edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "trim",
            videoUrl,
            startTime: nodeData.startTime || 0,
            endTime: nodeData.endTime || undefined,
            aspectRatio: detectedAspectRatio,
          }),
          timeout: 600000, // 10 minutes for video processing
        });

        const result = await response.json();

        if (!response.ok) {
          updateNodeData(nodeId, { isGenerating: false });
          return { success: false, error: result.error || "Video trim failed" };
        }

        // Update node with processed video
        updateNodeData(nodeId, {
          videoUrl: result.videoUrl,
          aspectRatio: detectedAspectRatio,
          isGenerating: false,
        });

        return {
          success: true,
          data: {
            message: `Video trim completed (${nodeData.startTime || 0}s - ${nodeData.endTime || "end"}s)`,
            videoUrl: result.videoUrl,
            aspectRatio: detectedAspectRatio,
          },
        };
      } catch {
        updateNodeData(nodeId, { isGenerating: false });
        throw new Error("Video trim failed");
      }
    },
    [extractVideoUrl, updateNodeData]
  );

  /**
   * Execute Video Transition node - adds transitions between video clips using FFmpeg
   */
  const executeVideoTransition = useCallback(
    async (
      nodeId: string,
      nodeData: VideoTransitionNodeData,
      inputs: ConnectedInput[]
    ): Promise<ExecutionResult> => {
      // Get video inputs with their metadata
      const videoInputs = inputs
        .filter(
          (input) =>
            input.handleType === "video" ||
            input.nodeType === "kling26" ||
            input.nodeType === "kling25Turbo" ||
            input.nodeType === "wan26" ||
            input.nodeType === "videoConcat" ||
            input.nodeType === "videoTrim" ||
            input.nodeType === "videoTransition" ||
            input.nodeType === "videoSubtitles" ||
            (input.nodeType === "file" &&
              (input.data as FileNodeData).fileType === "video")
        )
        // Sort by target handle to maintain correct order (videoIn, videoOut)
        .sort((a, b) => {
          // videoIn should come before videoOut
          if (a.targetHandle === "videoIn") return -1;
          if (b.targetHandle === "videoIn") return 1;
          return 0;
        });

      const videoUrls = videoInputs
        .map((input) => {
          const data = input.data as { videoUrl?: string };
          return data.videoUrl;
        })
        .filter((url): url is string => !!url);

      if (videoUrls.length < 2) {
        return {
          success: false,
          error: "Need at least 2 videos connected for transitions.",
        };
      }

      // Detect aspect ratio from first connected source
      let detectedAspectRatio: VideoTransitionNodeData["aspectRatio"] =
        nodeData.aspectRatio || "16:9";
      if (videoInputs.length > 0) {
        const firstInputData = videoInputs[0].data as {
          aspectRatio?: VideoTransitionNodeData["aspectRatio"];
        };
        if (firstInputData.aspectRatio) {
          detectedAspectRatio = firstInputData.aspectRatio;
        }
      }

      // Set generating state
      updateNodeData(nodeId, { isGenerating: true });

      try {
        // Call the video editing API
        const response = await apiFetch("/api/video-edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "transition",
            videoUrls,
            transitionType: nodeData.transitionType || "fade",
            transitionDuration: nodeData.duration || 0.5,
            aspectRatio: detectedAspectRatio,
          }),
          timeout: 600000, // 10 minutes for video processing
        });

        const result = await response.json();

        if (!response.ok) {
          updateNodeData(nodeId, { isGenerating: false });
          return {
            success: false,
            error: result.error || "Video transition failed",
          };
        }

        // Update node with processed video
        updateNodeData(nodeId, {
          videoUrl: result.videoUrl,
          aspectRatio: detectedAspectRatio,
          isGenerating: false,
        });

        return {
          success: true,
          data: {
            message: `Transition completed (${nodeData.transitionType || "fade"}, ${nodeData.duration || 0.5}s)`,
            videoUrl: result.videoUrl,
            aspectRatio: detectedAspectRatio,
          },
        };
      } catch {
        updateNodeData(nodeId, { isGenerating: false });
        throw new Error("Video transition failed");
      }
    },
    [updateNodeData]
  );

  /**
   * Main execution function - routes to appropriate handler based on node type
   */
  const executeNode = useCallback(
    async (nodeId: string): Promise<ExecutionResult> => {
      const nodes = getNodes();
      const node = nodes.find((n) => n.id === nodeId);

      if (!node) {
        return { success: false, error: "Node not found" };
      }

      setState((prev) => ({
        ...prev,
        isExecuting: true,
        executingNodeId: nodeId,
        error: null,
      }));

      try {
        const inputs = getConnectedInputs(nodeId);
        const nodeData = node.data as WorkflowNodeData;
        let result: ExecutionResult;

        switch (node.type) {
          case "nanoBananaPro":
            result = await executeNanoBananaPro(
              nodeId,
              nodeData as NanoBananaProNodeData,
              inputs
            );
            break;

          case "kling26":
            result = await executeKling26(
              nodeId,
              nodeData as Kling26NodeData,
              inputs
            );
            break;

          case "kling25Turbo":
            result = await executeKling25Turbo(
              nodeId,
              nodeData as Kling25TurboNodeData,
              inputs
            );
            break;

          case "wan26":
            result = await executeWan26(
              nodeId,
              nodeData as Wan26NodeData,
              inputs
            );
            break;

          case "videoConcat":
            result = await executeVideoConcat(
              nodeId,
              nodeData as VideoConcatNodeData,
              inputs
            );
            break;

          case "videoSubtitles":
            result = await executeVideoSubtitles(
              nodeId,
              nodeData as VideoSubtitlesNodeData,
              inputs
            );
            break;

          case "videoTrim":
            result = await executeVideoTrim(
              nodeId,
              nodeData as VideoTrimNodeData,
              inputs
            );
            break;

          case "videoTransition":
            result = await executeVideoTransition(
              nodeId,
              nodeData as VideoTransitionNodeData,
              inputs
            );
            break;

          default:
            result = {
              success: false,
              error: `Node type "${node.type}" does not support execution`,
            };
        }

        setState((prev) => ({
          ...prev,
          isExecuting: prev.executingNodeIds.length > 0, // Keep executing if part of executeAll
          executingNodeId: null,
          error: result.success ? null : result.error || null,
        }));

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Execution failed";
        setState((prev) => ({
          ...prev,
          isExecuting: prev.executingNodeIds.length > 0, // Keep executing if part of executeAll
          executingNodeId: null,
          error: errorMessage,
        }));
        return { success: false, error: errorMessage };
      }
    },
    [
      getNodes,
      getConnectedInputs,
      executeNanoBananaPro,
      executeKling26,
      executeKling25Turbo,
      executeWan26,
      executeVideoConcat,
      executeVideoSubtitles,
      executeVideoTrim,
      executeVideoTransition,
    ]
  );

  /**
   * Get upstream executable nodes that this node depends on
   */
  const getUpstreamExecutableNodes = useCallback(
    (nodeId: string, nodes: Node[], edges: Edge[]): string[] => {
      const upstreamIds: string[] = [];
      const visited = new Set<string>();

      const traverse = (currentId: string) => {
        if (visited.has(currentId)) return;
        visited.add(currentId);

        // Find all edges where this node is the target
        const incomingEdges = edges.filter((e) => e.target === currentId);

        for (const edge of incomingEdges) {
          const sourceNode = nodes.find((n) => n.id === edge.source);
          if (!sourceNode) continue;

          // If source is an executable node, add it as a dependency
          if (EXECUTABLE_NODE_TYPES.has(sourceNode.type || "")) {
            upstreamIds.push(sourceNode.id);
          }
          // Continue traversing upstream
          traverse(sourceNode.id);
        }
      };

      traverse(nodeId);
      return upstreamIds;
    },
    []
  );

  /**
   * Stop all currently executing nodes
   */
  const stopExecution = useCallback(() => {
    abortRef.current = true;

    // Reset generating state on all nodes
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        data: { ...node.data, isGenerating: false },
      }))
    );

    setState({
      isExecuting: false,
      executingNodeId: null,
      executingNodeIds: [],
      error: "Execution stopped by user",
    });
  }, [setNodes]);

  /**
   * Execute all nodes in the workflow using DAG-based parallel execution
   * - Independent nodes run in parallel
   * - Nodes wait for their upstream dependencies to complete
   */
  const executeAll = useCallback(async (): Promise<{
    success: boolean;
    completed: number;
    failed: number;
    errors: string[];
    stopped?: boolean;
  }> => {
    // Reset abort flag at start
    abortRef.current = false;

    const nodes = getNodes();
    const edges = getEdges();

    // Find all executable nodes
    const executableNodes = nodes.filter((n) =>
      EXECUTABLE_NODE_TYPES.has(n.type || "")
    );

    if (executableNodes.length === 0) {
      return { success: true, completed: 0, failed: 0, errors: [] };
    }

    // Build dependency map: nodeId -> upstream executable node IDs
    const dependencyMap = new Map<string, string[]>();
    for (const node of executableNodes) {
      const upstream = getUpstreamExecutableNodes(node.id, nodes, edges);
      dependencyMap.set(node.id, upstream);
    }

    // Track execution state
    const completed = new Set<string>();
    const failed = new Set<string>();
    const executing = new Set<string>();
    const errors: string[] = [];

    setState({
      isExecuting: true,
      executingNodeId: null,
      executingNodeIds: [],
      error: null,
    });

    /**
     * Check if a node is ready to execute (all dependencies completed)
     */
    const isReady = (nodeId: string): boolean => {
      if (
        completed.has(nodeId) ||
        failed.has(nodeId) ||
        executing.has(nodeId)
      ) {
        return false;
      }
      const deps = dependencyMap.get(nodeId) || [];
      return deps.every((depId) => completed.has(depId));
    };

    /**
     * Execute a single node and track its completion
     */
    const executeAndTrack = async (nodeId: string): Promise<void> => {
      // Check if execution was stopped
      if (abortRef.current) return;

      // Small delay to ensure React state has propagated from previous executions
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Check again after delay
      if (abortRef.current) return;

      executing.add(nodeId);
      setState((prev) => ({
        ...prev,
        executingNodeIds: [...prev.executingNodeIds, nodeId],
      }));

      try {
        const result = await executeNode(nodeId);
        // Check if stopped during execution
        if (abortRef.current) return;

        if (result.success) {
          completed.add(nodeId);
        } else {
          failed.add(nodeId);
          errors.push(`${nodeId}: ${result.error || "Unknown error"}`);
        }
      } catch {
        if (!abortRef.current) {
          failed.add(nodeId);
          errors.push(`${nodeId}: Execution failed`);
        }
      } finally {
        executing.delete(nodeId);
        if (!abortRef.current) {
          setState((prev) => ({
            ...prev,
            executingNodeIds: prev.executingNodeIds.filter((id) => id !== nodeId),
          }));
        }
      }
    };

    // Execute in waves until all nodes are processed
    const allNodeIds = new Set(executableNodes.map((n) => n.id));

    while (completed.size + failed.size < allNodeIds.size) {
      // Check if execution was stopped
      if (abortRef.current) {
        return {
          success: false,
          completed: completed.size,
          failed: failed.size,
          errors,
          stopped: true,
        };
      }

      // Find all nodes that are ready to execute
      const readyNodes = executableNodes
        .filter((n) => isReady(n.id))
        .map((n) => n.id);

      if (readyNodes.length === 0) {
        // No nodes ready but not all completed - might have circular dependencies or all failed
        const remaining = executableNodes.filter(
          (n) =>
            !completed.has(n.id) && !failed.has(n.id) && !executing.has(n.id)
        );
        if (remaining.length > 0 && executing.size === 0) {
          // Deadlock - mark remaining as failed
          for (const node of remaining) {
            failed.add(node.id);
            errors.push(`${node.id}: Dependencies could not be satisfied`);
          }
        } else if (executing.size > 0) {
          // Wait for currently executing nodes
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        continue;
      }

      // Execute all ready nodes in parallel
      await Promise.all(readyNodes.map(executeAndTrack));
    }

    // Final check if stopped
    if (abortRef.current) {
      return {
        success: false,
        completed: completed.size,
        failed: failed.size,
        errors,
        stopped: true,
      };
    }

    setState({
      isExecuting: false,
      executingNodeId: null,
      executingNodeIds: [],
      error: errors.length > 0 ? errors.join("; ") : null,
    });

    return {
      success: failed.size === 0,
      completed: completed.size,
      failed: failed.size,
      errors,
    };
  }, [getNodes, getEdges, getUpstreamExecutableNodes, executeNode]);

  /**
   * Check if a node can be executed (has required inputs)
   */
  const canExecuteNode = useCallback(
    (nodeId: string): { canExecute: boolean; reason?: string } => {
      const nodes = getNodes();
      const node = nodes.find((n) => n.id === nodeId);

      if (!node) {
        return { canExecute: false, reason: "Node not found" };
      }

      const inputs = getConnectedInputs(nodeId);
      const prompt = extractPrompt(inputs);
      const videoUrl = extractVideoUrl(inputs);

      switch (node.type) {
        case "nanoBananaPro": {
          const nodeData = node.data as NanoBananaProNodeData;
          if (!prompt && !nodeData.prompt) {
            return { canExecute: false, reason: "Connect a Prompt node" };
          }
          return { canExecute: true };
        }

        case "kling26":
        case "kling25Turbo":
        case "wan26":
          if (!prompt) {
            return { canExecute: false, reason: "Connect a Prompt node" };
          }
          return { canExecute: true };

        case "videoConcat": {
          // Get all connected video inputs
          const videoInputs = inputs.filter(
            (input) =>
              input.handleType === "video" ||
              input.nodeType === "kling26" ||
              input.nodeType === "kling25Turbo" ||
              input.nodeType === "wan26" ||
              (input.nodeType === "file" &&
                (input.data as FileNodeData).fileType === "video")
          );
          if (videoInputs.length === 0) {
            return { canExecute: false, reason: "Connect at least one video" };
          }
          return { canExecute: true };
        }

        case "videoSubtitles":
        case "videoTrim":
          if (!videoUrl) {
            return { canExecute: false, reason: "Connect a video source" };
          }
          return { canExecute: true };

        case "videoTransition": {
          const transitionVideoInputs = inputs.filter(
            (input) =>
              input.handleType === "video" ||
              input.nodeType === "kling26" ||
              input.nodeType === "kling25Turbo" ||
              input.nodeType === "wan26" ||
              (input.nodeType === "file" &&
                (input.data as FileNodeData).fileType === "video")
          );
          if (transitionVideoInputs.length < 2) {
            return { canExecute: false, reason: "Connect at least 2 videos" };
          }
          return { canExecute: true };
        }

        default:
          return {
            canExecute: false,
            reason: "Node type does not support execution",
          };
      }
    },
    [getNodes, getConnectedInputs, extractPrompt, extractVideoUrl]
  );

  return {
    executeNode,
    executeAll,
    stopExecution,
    canExecuteNode,
    getConnectedInputs,
    isExecuting: state.isExecuting,
    executingNodeId: state.executingNodeId,
    executingNodeIds: state.executingNodeIds,
    error: state.error,
  };
}
