/**
 * Kie.ai Kling 2.6 Video Generation API Module
 * Advanced AI video generation from text prompts or images
 */

// Types
export type Kling26Model =
  | "kling-2.6/text-to-video"
  | "kling-2.6/image-to-video";

export type Kling26AspectRatio = "1:1" | "16:9" | "9:16";

export type Kling26Duration = "5" | "10";

export type TaskState = "waiting" | "processing" | "success" | "fail";

export interface Kling26TextToVideoInput {
  /** Text description for video generation (max 1000 characters) */
  prompt: string;
  /** Include audio in generated video */
  sound: boolean;
  /** Video frame aspect ratio */
  aspect_ratio: Kling26AspectRatio;
  /** Video length in seconds */
  duration: Kling26Duration;
}

export interface Kling26ImageToVideoInput {
  /** Text description guiding video generation (max 1000 characters) */
  prompt: string;
  /** Array containing single image URL (JPEG, PNG, WebP; max 10MB) */
  image_urls: string[];
  /** Include audio in generated video */
  sound: boolean;
  /** Video length in seconds */
  duration: Kling26Duration;
}

export interface Kling26TextToVideoRequest {
  model: "kling-2.6/text-to-video";
  input: Kling26TextToVideoInput;
  callBackUrl?: string;
}

export interface Kling26ImageToVideoRequest {
  model: "kling-2.6/image-to-video";
  input: Kling26ImageToVideoInput;
  callBackUrl?: string;
}

export type Kling26Request =
  | Kling26TextToVideoRequest
  | Kling26ImageToVideoRequest;

export interface CreateTaskResponse {
  code: number;
  msg: string;
  data?: {
    taskId: string;
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
export const DEFAULT_ASPECT_RATIO: Kling26AspectRatio = "16:9";
export const DEFAULT_DURATION: Kling26Duration = "5";
export const DEFAULT_SOUND = true;

// Available options for frontend
export const ASPECT_RATIOS: Kling26AspectRatio[] = ["1:1", "16:9", "9:16"];
export const DURATIONS: Kling26Duration[] = ["5", "10"];

export const MAX_PROMPT_LENGTH = 1000;
export const MAX_IMAGE_URLS = 1;
export const MAX_IMAGE_SIZE_MB = 10;

/**
 * Kling 2.6 Video Generation API Client
 */
export class Kling26Client {
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
    input: Kling26TextToVideoInput,
    callBackUrl?: string
  ): Promise<CreateTaskResponse> {
    if (input.prompt.length > MAX_PROMPT_LENGTH) {
      throw new Error(
        `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters`
      );
    }

    const request: Kling26TextToVideoRequest = {
      model: "kling-2.6/text-to-video",
      input: {
        prompt: input.prompt,
        sound: input.sound,
        aspect_ratio: input.aspect_ratio,
        duration: input.duration,
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
    input: Kling26ImageToVideoInput,
    callBackUrl?: string
  ): Promise<CreateTaskResponse> {
    if (input.prompt.length > MAX_PROMPT_LENGTH) {
      throw new Error(
        `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters`
      );
    }

    if (input.image_urls.length > MAX_IMAGE_URLS) {
      throw new Error(`Maximum ${MAX_IMAGE_URLS} image URL allowed`);
    }

    if (input.image_urls.length === 0) {
      throw new Error("At least one image URL is required");
    }

    const request: Kling26ImageToVideoRequest = {
      model: "kling-2.6/image-to-video",
      input: {
        prompt: input.prompt,
        image_urls: input.image_urls,
        sound: input.sound,
        duration: input.duration,
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
    input: Kling26TextToVideoInput,
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
    input: Kling26ImageToVideoInput,
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
 * Create a new Kling 2.6 client
 */
export function createKling26Client(apiKey: string): Kling26Client {
  return new Kling26Client(apiKey);
}
