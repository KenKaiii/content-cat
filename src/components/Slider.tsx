"use client";

import { useState, useRef, useCallback } from "react";

interface SliderProps {
  min?: number;
  max?: number;
  value?: number;
  onChange?: (value: number) => void;
  className?: string;
}

export default function Slider({
  min = 0,
  max = 4,
  value: controlledValue,
  onChange,
  className = "",
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(3);
  const value = controlledValue ?? internalValue;
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const updateValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      const newValue = Math.round(min + percent * (max - min));
      if (onChange) {
        onChange(newValue);
      } else {
        setInternalValue(newValue);
      }
    },
    [min, max, onChange]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    updateValue(e.clientX);

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        updateValue(e.clientX);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newValue = value;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      newValue = Math.min(max, value + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      newValue = Math.max(min, value - 1);
    }
    if (newValue !== value) {
      if (onChange) {
        onChange(newValue);
      } else {
        setInternalValue(newValue);
      }
    }
  };

  return (
    <span
      dir="ltr"
      data-orientation="horizontal"
      className={`relative flex w-36 touch-none items-center select-none ${className}`}
      style={
        {
          "--slider-thumb-transform": "translateX(-50%)",
        } as React.CSSProperties
      }
    >
      <span
        ref={trackRef}
        data-orientation="horizontal"
        className="relative h-1.5 w-full grow cursor-pointer overflow-hidden rounded-full bg-zinc-700"
        onMouseDown={handleMouseDown}
      >
        <span
          className="absolute h-full bg-cyan-400"
          style={{ width: `${percentage}%` }}
        />
      </span>
      <span
        style={{
          transform: "var(--slider-thumb-transform)",
          position: "absolute",
          left: `calc(${percentage}% - 3px)`,
        }}
      >
        <span
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-orientation="horizontal"
          data-orientation="horizontal"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="block h-4 w-4 cursor-grab rounded-full border-2 border-cyan-400 bg-zinc-900 shadow-lg ring-offset-zinc-900 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:outline-none active:cursor-grabbing"
        />
      </span>
    </span>
  );
}
