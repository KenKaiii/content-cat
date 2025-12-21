"use client";

import { memo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useDropdownPosition } from "@/hooks/useDropdownPosition";
import type { BaseDropdownProps } from "./types";

interface GridDropdownProps extends BaseDropdownProps {
  options: { id: string; label: string; description?: string }[];
}

export const GridDropdown = memo(function GridDropdown({
  options,
  value,
  onChange,
  isOpen,
  onClose,
  triggerRef,
}: GridDropdownProps) {
  const { dropdownRef, position } = useDropdownPosition({
    isOpen,
    triggerRef,
    onClose,
    adjustForViewport: true,
    maxHeight: 400,
  });

  const handleSelect = useCallback(
    (optionId: string) => {
      onChange(optionId);
      onClose();
    },
    [onChange, onClose]
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={{ top: position.top, left: position.left }}
      className="fixed z-[9999] w-80 rounded-2xl border border-zinc-700 bg-zinc-800 p-2 shadow-xl"
    >
      <div className="hide-scrollbar max-h-[360px] overflow-y-auto">
        <div className="grid grid-cols-2 gap-1">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`flex w-full flex-col items-start rounded-lg px-2.5 py-2 text-left transition-colors outline-none hover:bg-white/5 ${
                value === option.id ? "bg-white/10 ring-1 ring-pink-400/50" : ""
              }`}
            >
              <span className="text-xs font-medium text-white capitalize">
                {option.label}
              </span>
              {option.description && (
                <span className="line-clamp-1 text-[10px] text-gray-500">
                  {option.description}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
});
