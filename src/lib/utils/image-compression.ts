// Image compression constants
export const MAX_BASE64_SIZE = 4 * 1024 * 1024; // 4MB target for base64
export const MAX_IMAGE_DIMENSION = 2048; // Max pixels on longest side

// Worker pool for parallel compression
const workerPool: Worker[] = [];
let workerIndex = 0;
const POOL_SIZE = navigator.hardwareConcurrency || 2;

function getWorker(): Worker | null {
  if (typeof window === "undefined") return null;

  // Lazily create worker pool
  if (workerPool.length === 0 && typeof Worker !== "undefined") {
    try {
      for (let i = 0; i < Math.min(POOL_SIZE, 4); i++) {
        const worker = new Worker(
          new URL("./image-compression.worker.ts", import.meta.url)
        );
        workerPool.push(worker);
      }
    } catch {
      // Workers not supported, will fall back to main thread
      return null;
    }
  }

  if (workerPool.length === 0) return null;

  const worker = workerPool[workerIndex % workerPool.length];
  workerIndex++;
  return worker;
}

/**
 * Compress image using Web Worker (non-blocking)
 * Falls back to main thread compression if workers unavailable
 */
export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;

      // Try Web Worker first for non-blocking compression
      const worker = getWorker();
      if (worker && typeof OffscreenCanvas !== "undefined") {
        try {
          // Get image data to send to worker
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("Failed to get canvas context");
          }
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, width, height);

          // Use worker for compression
          const result = await new Promise<string>((res, rej) => {
            const handler = (e: MessageEvent) => {
              worker.removeEventListener("message", handler);
              if (e.data.type === "success") {
                res(e.data.base64);
              } else {
                rej(new Error(e.data.error));
              }
            };
            worker.addEventListener("message", handler);
            worker.postMessage({ type: "compress", imageData, width, height }, [
              imageData.data.buffer,
            ]);
          });
          resolve(result);
          return;
        } catch {
          // Fall through to main thread compression
        }
      }

      // Fallback: Main thread compression (blocking but works everywhere)
      compressOnMainThread(img, width, height, resolve, reject);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
};

/**
 * Fallback compression on main thread
 */
function compressOnMainThread(
  img: HTMLImageElement,
  originalWidth: number,
  originalHeight: number,
  resolve: (value: string) => void,
  reject: (error: Error) => void
) {
  let width = originalWidth;
  let height = originalHeight;

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
    reject(new Error("Failed to get canvas context"));
    return;
  }
  ctx.drawImage(img, 0, 0, width, height);

  const qualities = [0.92, 0.85, 0.75, 0.65, 0.5];
  for (const quality of qualities) {
    const base64 = canvas.toDataURL("image/jpeg", quality);
    if (base64.length <= MAX_BASE64_SIZE) {
      resolve(base64);
      return;
    }
  }

  resolve(canvas.toDataURL("image/jpeg", 0.5));
}
