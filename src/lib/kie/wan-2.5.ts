/**
 * Kie.ai Wan 2.5 Video Generation API Module
 * High-quality video generation with native audio synchronization
 */

// Types
export type Wan25Model = "wan/2-5-text-to-video" | "wan/2-5-image-to-video";

export type Wan25AspectRatio = "16:9" | "9:16" | "1:1";

export type Wan25Resolution = "720p" | "1080p";

export type Wan25Duration = "5" | "10";

export type TaskState = "waiting" | "processing" | "success" | "fail";

export interface Wan25TextToVideoInput {
  /** Text description for video generation (max 800 characters) */
  prompt: string;
  /** Content to avoid in generation (max 500 characters) */
  negative_prompt?: string;
  /** Video frame aspect ratio */
  aspect_ratio?: Wan25AspectRatio;
  /** Output video resolution */
  resolution?: Wan25Resolution;
  /** Video length in seconds */
  duration?: Wan25Duration;
  /** Use LLM to enhance the prompt */
  enable_prompt_expansion?: boolean;
  /** Random seed for reproducibility (0-2147483647) */
  seed?: number;
}

export interface Wan25ImageToVideoInput {
  /** Text description guiding video generation (max 800 characters) */
  prompt: string;
  /** Input image URL (JPEG, PNG, WebP; max 10MB) */
  image_url: string;
  /** Content to avoid in generation (max 500 characters) */
  negative_prompt?: string;
  /** Output video resolution */
  resolution?: Wan25Resolution;
  /** Video length in seconds */
  duration?: Wan25Duration;
  /** Use LLM to enhance the prompt */
  enable_prompt_expansion?: boolean;
  /** Random seed for reproducibility (0-2147483647) */
  seed?: number;
}

export interface Wan25TextToVideoRequest {
  model: "wan/2-5-text-to-video";
  input: Wan25TextToVideoInput;
  callBackUrl?: string;
}

export interface Wan25ImageToVideoRequest {
  model: "wan/2-5-image-to-video";
  input: Wan25ImageToVideoInput;
  callBackUrl?: string;
}

export type Wan25Request = Wan25TextToVideoRequest | Wan25ImageToVideoRequest;

export interface CreateTaskResponse {
  code: number;
  msg: string;
  data?: {
    taskId: string;
    recordId?: string;
  };
}

export interface TaskResultData {
  taskId: string;
  model: string;
  state: TaskState;
  param: string;
  resultJson: string;
  failCode: string | null;
  failMsg: string | null;
  costTime: number | null;
  completeTime: number | null;
  createTime: number;
}

export interface TaskResult {
  code: number;
  msg: string;
  data?: TaskResultData;
}

export interface ParsedTaskOutput {
  /** Array of generated video URLs */
  resultUrls?: string[];
  [key: string]: unknown;
}

// Constants
const API_BASE_URL = "https://api.kie.ai/api/v1";
const CREATE_TASK_ENDPOINT = `${API_BASE_URL}/jobs/createTask`;
const GET_TASK_ENDPOINT = `${API_BASE_URL}/jobs/recordInfo`;

// Default values
export const DEFAULT_ASPECT_RATIO: Wan25AspectRatio = "16:9";
export const DEFAULT_RESOLUTION: Wan25Resolution = "720p";
export const DEFAULT_DURATION: Wan25Duration = "5";
export const DEFAULT_ENABLE_PROMPT_EXPANSION = false;

// Available options for frontend
export const ASPECT_RATIOS: Wan25AspectRatio[] = ["16:9", "9:16", "1:1"];
export const RESOLUTIONS: Wan25Resolution[] = ["720p", "1080p"];
export const DURATIONS: Wan25Duration[] = ["5", "10"];

export const MAX_PROMPT_LENGTH = 800;
export const MAX_NEGATIVE_PROMPT_LENGTH = 500;
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_SEED = 2147483647;

/**
 * Wan 2.5 Video Generation API Client
 */
export class Wan25Client {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    this.apiKey = apiKey;
  }

  private getHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Create a text-to-video generation task
   */
  async createTextToVideoTask(
    input: Wan25TextToVideoInput,
    callBackUrl?: string
  ): Promise<CreateTaskResponse> {
    if (input.prompt.length > MAX_PROMPT_LENGTH) {
      throw new Error(
        `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters`
      );
    }

    if (
      input.negative_prompt &&
      input.negative_prompt.length > MAX_NEGATIVE_PROMPT_LENGTH
    ) {
      throw new Error(
        `Negative prompt exceeds maximum length of ${MAX_NEGATIVE_PROMPT_LENGTH} characters`
      );
    }

    const request: Wan25TextToVideoRequest = {
      model: "wan/2-5-text-to-video",
      input: {
        prompt: input.prompt,
        ...(input.negative_prompt && {
          negative_prompt: input.negative_prompt,
        }),
        aspect_ratio: input.aspect_ratio || DEFAULT_ASPECT_RATIO,
        resolution: input.resolution || DEFAULT_RESOLUTION,
        duration: input.duration || DEFAULT_DURATION,
        enable_prompt_expansion:
          input.enable_prompt_expansion ?? DEFAULT_ENABLE_PROMPT_EXPANSION,
        ...(input.seed !== undefined && { seed: input.seed }),
      },
      ...(callBackUrl && { callBackUrl }),
    };

    const response = await fetch(CREATE_TASK_ENDPOINT, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    const data: CreateTaskResponse = await response.json();

    if (data.code !== 200) {
      throw new Error(`API Error: ${data.msg} (code: ${data.code})`);
    }

    return data;
  }

  /**
   * Create an image-to-video generation task
   */
  async createImageToVideoTask(
    input: Wan25ImageToVideoInput,
    callBackUrl?: string
  ): Promise<CreateTaskResponse> {
    if (input.prompt.length > MAX_PROMPT_LENGTH) {
      throw new Error(
        `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters`
      );
    }

    if (
      input.negative_prompt &&
      input.negative_prompt.length > MAX_NEGATIVE_PROMPT_LENGTH
    ) {
      throw new Error(
        `Negative prompt exceeds maximum length of ${MAX_NEGATIVE_PROMPT_LENGTH} characters`
      );
    }

    if (!input.image_url) {
      throw new Error("Image URL is required for image-to-video");
    }

    const request: Wan25ImageToVideoRequest = {
      model: "wan/2-5-image-to-video",
      input: {
        prompt: input.prompt,
        image_url: input.image_url,
        ...(input.negative_prompt && {
          negative_prompt: input.negative_prompt,
        }),
        resolution: input.resolution || DEFAULT_RESOLUTION,
        duration: input.duration || DEFAULT_DURATION,
        enable_prompt_expansion:
          input.enable_prompt_expansion ?? DEFAULT_ENABLE_PROMPT_EXPANSION,
        ...(input.seed !== undefined && { seed: input.seed }),
      },
      ...(callBackUrl && { callBackUrl }),
    };

    const response = await fetch(CREATE_TASK_ENDPOINT, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    const data: CreateTaskResponse = await response.json();

    if (data.code !== 200) {
      throw new Error(`API Error: ${data.msg} (code: ${data.code})`);
    }

    return data;
  }

  /**
   * Get task status and results
   */
  async getTask(taskId: string): Promise<TaskResult> {
    const url = new URL(GET_TASK_ENDPOINT);
    url.searchParams.set("taskId", taskId);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data: TaskResult = await response.json();

    if (data.code !== 200) {
      throw new Error(`API Error: ${data.msg} (code: ${data.code})`);
    }

    return data;
  }

  /**
   * Parse the result JSON from a completed task
   */
  parseResultJson(resultJson: string): ParsedTaskOutput | null {
    if (!resultJson) return null;
    try {
      return JSON.parse(resultJson) as ParsedTaskOutput;
    } catch {
      return null;
    }
  }

  /**
   * Generate video from text with polling
   */
  async generateTextToVideo(
    input: Wan25TextToVideoInput,
    options?: {
      pollInterval?: number;
      maxAttempts?: number;
      onStateUpdate?: (state: TaskState) => void;
    }
  ): Promise<{ task: TaskResult; output: ParsedTaskOutput | null }> {
    const pollInterval = options?.pollInterval || 5000;
    const maxAttempts = options?.maxAttempts || 120;

    const createResponse = await this.createTextToVideoTask(input);
    const taskId = createResponse.data?.taskId;

    if (!taskId) {
      throw new Error("Failed to get task ID from response");
    }

    return this.pollForCompletion(
      taskId,
      pollInterval,
      maxAttempts,
      options?.onStateUpdate
    );
  }

  /**
   * Generate video from image with polling
   */
  async generateImageToVideo(
    input: Wan25ImageToVideoInput,
    options?: {
      pollInterval?: number;
      maxAttempts?: number;
      onStateUpdate?: (state: TaskState) => void;
    }
  ): Promise<{ task: TaskResult; output: ParsedTaskOutput | null }> {
    const pollInterval = options?.pollInterval || 5000;
    const maxAttempts = options?.maxAttempts || 120;

    const createResponse = await this.createImageToVideoTask(input);
    const taskId = createResponse.data?.taskId;

    if (!taskId) {
      throw new Error("Failed to get task ID from response");
    }

    return this.pollForCompletion(
      taskId,
      pollInterval,
      maxAttempts,
      options?.onStateUpdate
    );
  }

  /**
   * Poll for task completion
   */
  private async pollForCompletion(
    taskId: string,
    pollInterval: number,
    maxAttempts: number,
    onStateUpdate?: (state: TaskState) => void
  ): Promise<{ task: TaskResult; output: ParsedTaskOutput | null }> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const taskResult = await this.getTask(taskId);
      const state = taskResult.data?.state;

      if (onStateUpdate && state) {
        onStateUpdate(state);
      }

      if (state === "success") {
        const output = this.parseResultJson(taskResult.data?.resultJson || "");
        return { task: taskResult, output };
      }

      if (state === "fail") {
        throw new Error(
          `Task failed: ${taskResult.data?.failMsg || "Unknown error"} (code: ${taskResult.data?.failCode})`
        );
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Task timed out after ${maxAttempts} attempts`);
  }
}

/**
 * Create a new Wan 2.5 client
 */
export function createWan25Client(apiKey: string): Wan25Client {
  return new Wan25Client(apiKey);
}
