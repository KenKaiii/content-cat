"use client";

import { memo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useDropdownPosition } from "@/hooks/useDropdownPosition";
import { ChevronRightIcon } from "./DropdownIcons";
import type { BaseDropdownProps, DropdownOption } from "./types";

interface DropdownProps extends BaseDropdownProps {
  options: DropdownOption[];
}

export const Dropdown = memo(function Dropdown({
  options,
  value,
  onChange,
  isOpen,
  onClose,
  triggerRef,
}: DropdownProps) {
  const { dropdownRef, position } = useDropdownPosition({
    isOpen,
    triggerRef,
    onClose,
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
      className="fixed z-[9999] w-64 rounded-2xl border border-zinc-700 bg-zinc-800 p-2 shadow-xl"
    >
      <div className="flex flex-col gap-1">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors outline-none hover:bg-white/5 ${
              value === option.id
                ? "bg-pink-400/10 ring-1 ring-pink-400/30"
                : ""
            }`}
          >
            {option.icon && (
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                  value === option.id ? "bg-pink-400/20" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`size-5 ${value === option.id ? "text-pink-400" : "text-white"}`}
                >
                  {option.icon}
                </div>
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
              <p className="truncate text-sm font-medium text-white">
                {option.label}
              </p>
              {option.description && (
                <p className="truncate text-xs text-gray-400">
                  {option.description}
                </p>
              )}
            </div>
            <ChevronRightIcon />
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
});
