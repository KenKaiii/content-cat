"use client";

import type { NodeProps, Node } from "@xyflow/react";
import BaseNode from "./BaseNode";
import type { ModelNodeData } from "../types";

export default function ModelNode({
  data,
  selected,
}: NodeProps<Node<ModelNodeData>>) {
  return (
    <BaseNode
      label={data.label || "Model"}
      selected={selected}
      inputs={[
        { id: "video", label: "Video", color: "#EF9092" },
        { id: "prompt", label: "Prompt", color: "#A78BFA" },
      ]}
      outputs={[{ id: "result", label: "Result", color: "#6EDDB3" }]}
    >
      <div className="flex flex-col gap-4">
        {/* Model Selection */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-gray-400">Model</span>
          <select
            className="nodrag w-full cursor-pointer appearance-none rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none"
            style={{ backgroundColor: "rgb(31, 31, 35)", border: "none" }}
            defaultValue={data.modelId || ""}
          >
            <option value="">Select model...</option>
            <option value="flux-pro">FLUX Pro</option>
            <option value="flux-dev">FLUX Dev</option>
            <option value="stable-diffusion-xl">Stable Diffusion XL</option>
            <option value="minimax-video">MiniMax Video</option>
            <option value="kling">Kling</option>
          </select>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-gray-400">Steps</span>
          <input
            type="number"
            className="nodrag w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            style={{ backgroundColor: "rgb(31, 31, 35)", border: "none" }}
            defaultValue={30}
            min={1}
            max={100}
          />
        </div>

        {/* Guidance Scale */}
        <div className="flex flex-col gap-2">
          <span className="text-xs text-gray-400">Guidance Scale</span>
          <input
            type="number"
            className="nodrag w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
            style={{ backgroundColor: "rgb(31, 31, 35)", border: "none" }}
            defaultValue={7.5}
            min={0}
            max={20}
            step={0.5}
          />
        </div>
      </div>
    </BaseNode>
  );
}
