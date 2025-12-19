"use client";

import { memo } from "react";
import type { NodeProps, Node } from "@xyflow/react";
import BaseNode from "./BaseNode";
import type { ImageInputNodeData } from "../types";

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

const ImageInputNode = memo(function ImageInputNode({
  data,
  selected,
}: NodeProps<Node<ImageInputNodeData>>) {
  return (
    <BaseNode
      label={data.label || "Image Input"}
      selected={selected}
      inputs={[]}
      outputs={[{ id: "image", label: "Image", color: "#6EDDB3" }]}
    >
      <div className="flex flex-col gap-3">
        {/* Media Container - ~4:4.25 aspect ratio */}
        <div
          className="nodrag flex w-full cursor-pointer items-center justify-center rounded-lg transition-opacity hover:opacity-80"
          style={{
            aspectRatio: "4 / 4.25",
            ...(data.imageUrl
              ? { backgroundColor: "rgb(31, 31, 35)" }
              : {
                  backgroundImage: `
                    linear-gradient(45deg, #1f1f23 25%, transparent 25%),
                    linear-gradient(-45deg, #1f1f23 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #1f1f23 75%),
                    linear-gradient(-45deg, transparent 75%, #1f1f23 75%)
                  `,
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                  backgroundColor: "#2b2b2f",
                }),
          }}
        >
          {data.imageUrl ? (
            <img
              src={data.imageUrl}
              alt="Input"
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <button className="nodrag inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-medium text-cyan-400 backdrop-blur-sm transition-all hover:bg-cyan-400/20">
              <UploadIcon />
              Upload
            </button>
          )}
        </div>

        {/* File info */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[8px] text-gray-400">Format</span>
            <span className="text-[8px] text-gray-300">PNG / JPG</span>
          </div>
        </div>
      </div>
    </BaseNode>
  );
});

export default ImageInputNode;
