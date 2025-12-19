"use client";

import type { NodeProps, Node } from "@xyflow/react";
import BaseNode from "./BaseNode";
import type { PreviewNodeData } from "../types";

export default function PreviewNode({
  data,
  selected,
}: NodeProps<Node<PreviewNodeData>>) {
  return (
    <BaseNode
      label={data.label || "Preview"}
      selected={selected}
      inputs={[{ id: "media", label: "Media", color: "#F59E0B" }]}
      outputs={[]}
    >
      <div className="flex flex-col gap-3">
        {/* Media Container */}
        <div
          className="flex aspect-video w-full items-center justify-center rounded-lg"
          style={{ backgroundColor: "rgb(31, 31, 35)" }}
        >
          {data.previewUrl ? (
            <img
              src={data.previewUrl}
              alt="Preview"
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="text-xs">Connect to preview</span>
            </div>
          )}
        </div>

        {/* Frame info */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Frame</span>
            <input
              type="text"
              className="nodrag w-16 rounded px-2 py-1 text-right text-xs text-white focus:outline-none"
              style={{ backgroundColor: "rgb(31, 31, 35)", border: "none" }}
              defaultValue="0"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Timecode</span>
            <input
              type="text"
              className="nodrag w-20 rounded px-2 py-1 text-right text-xs text-gray-500"
              style={{ backgroundColor: "rgb(31, 31, 35)", border: "none" }}
              defaultValue="00:00:00"
              disabled
            />
          </div>
        </div>
      </div>
    </BaseNode>
  );
}
