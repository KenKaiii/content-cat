"use client";

import { memo, useRef, useCallback } from "react";
import type { NodeProps, Node } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import BaseNode from "./BaseNode";
import type { NanoBananaProNodeData } from "../types";

const UploadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const UploadIconSmall = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const LibraryIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const NODE_WIDTH = 248;
const DEFAULT_ASPECT_RATIO = 4 / 4.25;
const containerHeight = Math.round(NODE_WIDTH / DEFAULT_ASPECT_RATIO);

const NanoBananaProNode = memo(function NanoBananaProNode({
  id,
  data,
  selected,
}: NodeProps<Node<NanoBananaProNodeData>>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setNodes } = useReactFlow();

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setNodes((nodes) =>
          nodes.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, imageUrl: url } }
              : node
          )
        );
      }
    },
    [id, setNodes]
  );

  return (
    <BaseNode
      label={data.label || "Nano Banana Pro"}
      selected={selected}
      inputs={[
        { id: "prompt", label: "Prompt", color: "#A78BFA" },
        { id: "image", label: "Image", color: "#F59E0B" },
      ]}
      outputs={[{ id: "image", label: "Image", color: "#6EDDB3" }]}
    >
      <div className="flex flex-col gap-3">
        {/* Image Container */}
        <div
          className="nodrag relative w-full overflow-hidden rounded-lg"
          style={{
            backgroundColor: "rgb(31, 31, 35)",
            height: containerHeight,
          }}
        >
          {data.imageUrl ? (
            <img
              src={data.imageUrl}
              alt="Generated"
              className="h-full w-full object-contain"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #1f1f23 25%, transparent 25%),
                  linear-gradient(-45deg, #1f1f23 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #1f1f23 75%),
                  linear-gradient(-45deg, transparent 75%, #1f1f23 75%)
                `,
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                backgroundColor: "#2b2b2f",
              }}
            >
              <button
                onClick={handleUploadClick}
                className="nodrag inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-medium text-cyan-400 backdrop-blur-sm transition-all hover:bg-cyan-400/20"
              >
                <UploadIcon />
                Upload
              </button>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleUploadClick}
            className="flex flex-1 items-center justify-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-[8px] text-gray-300 transition-colors hover:border-zinc-600 hover:text-white"
          >
            <UploadIconSmall />
            Upload
          </button>
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-[8px] text-gray-300 transition-colors hover:border-zinc-600 hover:text-white">
            <LibraryIcon />
            Library
          </button>
        </div>

        {/* Model badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-cyan-500" />
            <span className="text-[8px] text-gray-400">Fast Generation</span>
          </div>
          <span className="text-[8px] text-gray-500">$0.02/image</span>
        </div>
      </div>
    </BaseNode>
  );
});

export default NanoBananaProNode;
