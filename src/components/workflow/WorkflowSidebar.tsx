"use client";

import type { NodeType, SidebarNodeItem } from "./types";

const nodeItems: SidebarNodeItem[] = [
  {
    type: "imageInput",
    label: "Image Input",
    description: "Upload or reference an image",
    icon: "🖼️",
  },
  {
    type: "prompt",
    label: "Prompt",
    description: "Text prompt for generation",
    icon: "📝",
  },
  {
    type: "model",
    label: "Model",
    description: "AI model for processing",
    icon: "🧠",
  },
  {
    type: "output",
    label: "Output",
    description: "Final output destination",
    icon: "✅",
  },
  {
    type: "preview",
    label: "Preview",
    description: "Preview intermediate results",
    icon: "👁️",
  },
];

interface WorkflowSidebarProps {
  onAddNode: (type: NodeType) => void;
  onReset?: () => void;
}

export default function WorkflowSidebar({
  onAddNode,
  onReset,
}: WorkflowSidebarProps) {
  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: NodeType
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Nodes</h2>
        <p className="text-xs text-gray-400">Drag to add to canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-2">
          {nodeItems.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => handleDragStart(e, item.type)}
              onClick={() => onAddNode(item.type)}
              className="flex cursor-grab items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-800/50 p-3 transition-all hover:border-cyan-400/50 hover:bg-zinc-800 active:cursor-grabbing"
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  {item.label}
                </span>
                <span className="text-xs text-gray-400">
                  {item.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-800 p-3">
        <button
          onClick={onReset}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-gray-300 transition-colors hover:border-zinc-600 hover:bg-zinc-700"
        >
          Reset Workflow
        </button>
      </div>
    </aside>
  );
}
