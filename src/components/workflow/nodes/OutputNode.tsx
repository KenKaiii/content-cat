"use client";

import type { NodeProps, Node } from "@xyflow/react";
import BaseNode from "./BaseNode";
import type { OutputNodeData } from "../types";

// Match VideoNode dimensions exactly
const NODE_WIDTH = 248;
const DEFAULT_ASPECT_RATIO = 4 / 4.25;
const DEFAULT_HEIGHT = Math.round(NODE_WIDTH / DEFAULT_ASPECT_RATIO); // ~264px

export default function OutputNode({
  data,
  selected,
}: NodeProps<Node<OutputNodeData>>) {
  return (
    <BaseNode
      label={data.label || "Output"}
      selected={selected}
      inputs={[{ id: "result", label: "Result", color: "#6EDDB3" }]}
      outputs={[]}
    >
      <div className="flex flex-col gap-3">
        {/* Media Container */}
        <div
          className="flex w-full items-center justify-center overflow-hidden rounded-lg"
          style={{
            height: DEFAULT_HEIGHT,
            ...(data.outputUrl
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
          {data.outputUrl ? (
            <img
              src={data.outputUrl}
              alt="Output"
              className="h-full w-full rounded-lg object-contain"
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
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="text-xs">Waiting for output</span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Status</span>
            <span className="text-xs text-gray-300">Ready</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Format</span>
            <span className="text-xs text-gray-300">PNG</span>
          </div>
        </div>
      </div>
    </BaseNode>
  );
}
