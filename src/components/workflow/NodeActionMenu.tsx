"use client";

import { useMemo } from "react";
import { useStore } from "@xyflow/react";
import type { Node } from "@xyflow/react";

// Icons
const PlayIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

interface NodeActionMenuProps {
  onRun?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

// Menu height + spacing threshold for visibility check
const MENU_HEIGHT = 44; // Approximate height of the menu (padding + button height)
const SPACING = 12;

export default function NodeActionMenu({
  onRun,
  onDelete,
}: NodeActionMenuProps) {
  // Subscribe to nodes and transform from the store for instant reactivity
  const nodes = useStore((state) => state.nodes);
  const transform = useStore((state) => state.transform);

  // Find the selected node
  const selectedNode = useMemo(() => {
    const selected = nodes.filter((node: Node) => node.selected);
    return selected.length === 1 ? selected[0] : null;
  }, [nodes]);

  // Calculate position and determine if menu should be at top or bottom
  const { position, showBelow } = useMemo(() => {
    if (!selectedNode) return { position: null, showBelow: false };

    const [x, y, zoom] = transform;
    const nodeWidth = (selectedNode.measured?.width || 280) * zoom;
    const nodeHeight = (selectedNode.measured?.height || 200) * zoom;

    // Calculate the top position
    const topY = selectedNode.position.y * zoom + y - SPACING;

    // Check if menu would be cut off at the top (need space for menu height)
    const shouldShowBelow = topY < MENU_HEIGHT + SPACING;

    return {
      position: {
        x: selectedNode.position.x * zoom + x + nodeWidth / 2,
        y: shouldShowBelow
          ? selectedNode.position.y * zoom + y + nodeHeight + SPACING
          : topY,
      },
      showBelow: shouldShowBelow,
    };
  }, [selectedNode, transform]);

  const handleRun = () => {
    if (onRun && selectedNode) {
      onRun(selectedNode.id);
    }
  };

  const handleDelete = () => {
    if (onDelete && selectedNode) {
      onDelete(selectedNode.id);
    }
  };

  return (
    <div
      className={`absolute z-50 flex items-center gap-1 rounded-xl border border-white/10 bg-zinc-900/90 p-1 shadow-lg backdrop-blur-xl transition-opacity duration-150 ${
        selectedNode && position
          ? "opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      style={{
        left: position?.x ?? 0,
        top: position?.y ?? 0,
        transform: showBelow ? "translate(-50%, 0)" : "translate(-50%, -100%)",
      }}
    >
      {/* Run Button */}
      <button
        onClick={handleRun}
        className="flex h-8 w-8 items-center justify-center rounded-[10px] text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
        title="Run node"
      >
        <PlayIcon />
      </button>

      {/* Divider */}
      <div className="h-5 w-px bg-white/10" />

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="flex h-8 w-8 items-center justify-center rounded-[10px] text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
        title="Delete node"
      >
        <TrashIcon />
      </button>
    </div>
  );
}
