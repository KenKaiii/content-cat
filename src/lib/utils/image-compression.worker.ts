// Web Worker for image compression - runs off the main thread
const MAX_BASE64_SIZE = 4 * 1024 * 1024; // 4MB target for base64
const MAX_IMAGE_DIMENSION = 2048; // Max pixels on longest side

interface CompressMessage {
  type: "compress";
  imageData: ImageData;
  width: number;
  height: number;
}

// Convert blob to base64 using async FileReader
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

self.onmessage = async (e: MessageEvent<CompressMessage>) => {
  if (e.data.type === "compress") {
    try {
      const { imageData, width, height } = e.data;

      // Calculate new dimensions
      let newWidth = width;
      let newHeight = height;
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        if (width > height) {
          newHeight = Math.round((height / width) * MAX_IMAGE_DIMENSION);
          newWidth = MAX_IMAGE_DIMENSION;
        } else {
          newWidth = Math.round((width / height) * MAX_IMAGE_DIMENSION);
          newHeight = MAX_IMAGE_DIMENSION;
        }
      }

      // Create OffscreenCanvas for compression
      const canvas = new OffscreenCanvas(newWidth, newHeight);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        self.postMessage({
          type: "error",
          error: "Failed to get canvas context",
        });
        return;
      }

      // Create ImageBitmap from the data and draw it
      const bitmap = await createImageBitmap(imageData);
      ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
      bitmap.close();

      // Try different quality levels
      const qualities = [0.92, 0.85, 0.75, 0.65, 0.5];
      for (const quality of qualities) {
        const blob = await canvas.convertToBlob({
          type: "image/jpeg",
          quality,
        });
        if (blob.size <= MAX_BASE64_SIZE * 0.75) {
          const base64 = await blobToBase64(blob);
          self.postMessage({ type: "success", base64 });
          return;
        }
      }

      // Use lowest quality if still too large
      const blob = await canvas.convertToBlob({
        type: "image/jpeg",
        quality: 0.5,
      });
      const base64 = await blobToBase64(blob);
      self.postMessage({ type: "success", base64 });
    } catch (error) {
      self.postMessage({
        type: "error",
        error: error instanceof Error ? error.message : "Compression failed",
      });
    }
  }
};

export {};
