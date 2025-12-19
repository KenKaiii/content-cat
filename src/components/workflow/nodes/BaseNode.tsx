"use client";

import { memo, useCallback, useMemo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { ReactNode } from "react";
import { useWorkflowContext, COMPATIBLE_HANDLES } from "../WorkflowContext";

// Menu icon (three dots horizontal)
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 13.125C12.6213 13.125 13.125 12.6213 13.125 12C13.125 11.3787 12.6213 10.875 12 10.875C11.3787 10.875 10.875 11.3787 10.875 12C10.875 12.6213 11.3787 13.125 12 13.125Z"
      fill="currentColor"
    />
    <path
      d="M18.375 13.125C18.9963 13.125 19.5 12.6213 19.5 12C19.5 11.3787 18.9963 10.875 18.375 10.875C17.7537 10.875 17.25 11.3787 17.25 12C17.25 12.6213 17.7537 13.125 18.375 13.125Z"
      fill="currentColor"
    />
    <path
      d="M5.625 13.125C6.24632 13.125 6.75 12.6213 6.75 12C6.75 11.3787 6.24632 10.875 5.625 10.875C5.00368 10.875 4.5 11.3787 4.5 12C4.5 12.6213 5.00368 13.125 5.625 13.125Z"
      fill="currentColor"
    />
  </svg>
);

export interface HandleConfig {
  id: string;
  label: string;
  color?: string;
}

interface BaseNodeProps {
  children: ReactNode;
  label: string;
  selected?: boolean;
  inputs?: HandleConfig[];
  outputs?: HandleConfig[];
}

// Static styles for NodeHandle - defined outside to prevent recreation
const handleBaseStyle = {
  width: 16,
  height: 16,
  backgroundColor: "transparent",
  border: "none",
  transition: "opacity 0.2s ease",
};

const svgBaseStyle = {
  position: "absolute" as const,
  pointerEvents: "none" as const,
  transition: "transform 0.2s ease",
};

const labelTextStyle = {
  textTransform: "capitalize" as const,
  fontSize: 7,
  fontFamily: "monospace",
  whiteSpace: "nowrap" as const,
  fontWeight: 500,
};

// Custom styled handle - memoized to prevent re-renders during drag
const NodeHandle = memo(function NodeHandle({
  type,
  position,
  id,
  label,
  color = "#EF9092",
  selected = false,
  top,
  isCompatible = true,
  isConnecting = false,
}: {
  type: "source" | "target";
  position: Position;
  id: string;
  label: string;
  color?: string;
  selected?: boolean;
  top?: string;
  isCompatible?: boolean;
  isConnecting?: boolean;
}) {
  const isLeft = position === Position.Left;

  // Determine opacity based on connection state
  const isDimmed = isConnecting && !isCompatible;
  const isHighlighted = isConnecting && isCompatible;
  const handleOpacity = isDimmed ? 0.2 : 1;
  const displayColor = isDimmed ? "#666" : color;

  // Memoize computed styles
  const handleStyle = useMemo(
    () => ({
      ...handleBaseStyle,
      opacity: handleOpacity,
      ...(top && { top }),
    }),
    [handleOpacity, top]
  );

  const svgStyle = useMemo(
    () => ({
      ...svgBaseStyle,
      transform: isHighlighted ? "scale(1.2)" : "scale(1)",
    }),
    [isHighlighted]
  );

  const labelContainerStyle = useMemo(
    () => ({
      position: "absolute" as const,
      bottom: "100%",
      [isLeft ? "right" : "left"]: 16,
      marginBottom: -2,
      zIndex: 501,
    }),
    [isLeft]
  );

  return (
    <Handle
      type={type}
      position={position}
      id={id}
      className="group/handle !flex !items-center !justify-center"
      style={handleStyle}
    >
      {/* Outer colored ring */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        style={svgStyle}
      >
        <circle cx="8" cy="8" r="7" fill={displayColor} />
        <circle cx="8" cy="8" r="5" fill="rgb(43, 43, 47)" />
        <circle cx="8" cy="8" r="3" fill={displayColor} />
      </svg>
      {/* Label - visible on hover, when selected, or when highlighted */}
      <div
        className={`pointer-events-none transition-opacity duration-200 ${
          selected || isHighlighted
            ? "opacity-100"
            : "opacity-0 group-hover/handle:opacity-100"
        }`}
        style={labelContainerStyle}
      >
        <span style={{ ...labelTextStyle, color: displayColor }}>{label}</span>
      </div>
    </Handle>
  );
});

// Memoized BaseNode component for better performance during drag operations
const BaseNode = memo(function BaseNode({
  children,
  label,
  selected,
  inputs = [],
  outputs = [],
}: BaseNodeProps) {
  const { connectingHandleType } = useWorkflowContext();
  const isConnecting = connectingHandleType !== null;

  // Memoized compatibility checker
  const checkCompatibility = useCallback(
    (handleId: string, handleType: "source" | "target") => {
      if (!isConnecting || !connectingHandleType) return true;

      // When connecting from a source (output), we're looking for compatible targets (inputs)
      const compatibleTargets = COMPATIBLE_HANDLES[connectingHandleType] || [
        connectingHandleType,
      ];

      // Input handles (targets) should be highlighted if they match the source
      if (handleType === "target") {
        return compatibleTargets.includes(handleId);
      }

      // Output handles (sources) should be dimmed when we're connecting
      return false;
    },
    [isConnecting, connectingHandleType]
  );

  // Memoize container style to prevent object recreation
  const containerStyle = useMemo(
    () => ({
      backgroundColor: selected ? "rgb(55, 55, 60)" : "rgb(43, 43, 47)",
    }),
    [selected]
  );

  // Memoize button click handler
  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className="relative min-w-[280px] rounded-xl transition-all duration-200"
      style={containerStyle}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-[11px] font-normal text-white">{label}</span>
        <button
          className="text-gray-400 transition-colors hover:text-white"
          onClick={handleButtonClick}
        >
          <MenuIcon />
        </button>
      </div>

      {/* Content */}
      <div className="p-2">{children}</div>

      {/* Input Handles */}
      {inputs.map((input, index) => (
        <NodeHandle
          key={input.id}
          type="target"
          position={Position.Left}
          id={input.id}
          label={input.label}
          color={input.color || "#EF9092"}
          selected={selected}
          top={`${65 + index * 36}px`}
          isConnecting={isConnecting}
          isCompatible={checkCompatibility(input.id, "target")}
        />
      ))}

      {/* Output Handles */}
      {outputs.map((output, index) => (
        <NodeHandle
          key={output.id}
          type="source"
          position={Position.Right}
          id={output.id}
          label={output.label}
          color={output.color || "#6EDDB3"}
          selected={selected}
          top={`${65 + index * 36}px`}
          isConnecting={isConnecting}
          isCompatible={checkCompatibility(output.id, "source")}
        />
      ))}
    </div>
  );
});

export default BaseNode;
