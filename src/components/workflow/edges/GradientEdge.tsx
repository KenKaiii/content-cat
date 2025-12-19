"use client";

import { memo, useMemo } from "react";
import { getBezierPath, type EdgeProps } from "@xyflow/react";

// Map handle IDs to their colors
const HANDLE_COLORS: Record<string, string> = {
  prompt: "#A78BFA", // Purple
  video: "#EF9092", // Red/Pink
  image: "#F59E0B", // Orange
  result: "#6EDDB3", // Green
  media: "#F59E0B", // Orange
  audio: "#60A5FA", // Blue
};

const GradientEdge = memo(function GradientEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  sourceHandleId,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Get the color based on the source handle
  const edgeColor = useMemo(
    () => HANDLE_COLORS[sourceHandleId || ""] || "#6EDDB3",
    [sourceHandleId]
  );

  return (
    <path
      id={id}
      d={edgePath}
      fill="none"
      stroke={edgeColor}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
});

export default GradientEdge;
