"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Text, Rect } from "react-konva";

interface KonvaPreviewProps {
  imageUrl?: string | null;
  width?: number;
  height?: number;
  label?: string;
}

export default function KonvaPreview({
  imageUrl,
  width = 400,
  height = 300,
  label = "Preview",
}: KonvaPreviewProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Load image when URL changes
  useEffect(() => {
    if (!imageUrl) {
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);

      // Calculate dimensions to fit image within canvas while maintaining aspect ratio
      const aspectRatio = img.width / img.height;
      const canvasAspectRatio = width / height;

      let newWidth: number;
      let newHeight: number;

      if (aspectRatio > canvasAspectRatio) {
        newWidth = width - 40;
        newHeight = newWidth / aspectRatio;
      } else {
        newHeight = height - 60;
        newWidth = newHeight * aspectRatio;
      }

      setImageDimensions({
        width: newWidth,
        height: newHeight,
        x: (width - newWidth) / 2,
        y: (height - newHeight) / 2 + 10,
      });
    };

    return () => {
      // Cleanup: clear image when URL changes or component unmounts
      setImage(null);
    };
  }, [imageUrl, width, height]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900"
    >
      <div className="border-b border-zinc-800 px-4 py-2">
        <h3 className="text-sm font-medium text-white">{label}</h3>
      </div>
      <Stage width={width} height={height} className="bg-zinc-950">
        <Layer>
          {/* Background */}
          <Rect x={0} y={0} width={width} height={height} fill="#09090b" />

          {image ? (
            <KonvaImage
              image={image}
              x={imageDimensions.x}
              y={imageDimensions.y}
              width={imageDimensions.width}
              height={imageDimensions.height}
              cornerRadius={8}
            />
          ) : (
            <>
              {/* Placeholder background */}
              <Rect
                x={20}
                y={20}
                width={width - 40}
                height={height - 40}
                fill="#18181b"
                cornerRadius={8}
                stroke="#27272a"
                strokeWidth={1}
              />
              <Text
                x={0}
                y={height / 2 - 10}
                width={width}
                text="No image to preview"
                fontSize={14}
                fill="#71717a"
                align="center"
              />
            </>
          )}
        </Layer>
      </Stage>
    </div>
  );
}
