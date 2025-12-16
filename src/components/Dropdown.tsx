"use client";

import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const ChevronRightIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    className="size-6 text-gray-400"
  >
    <path
      d="M8.3335 13.3332L11.6668 9.99984L8.3335 6.6665"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface DropdownOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function Dropdown({
  options,
  value,
  onChange,
  isOpen,
  onClose,
  triggerRef,
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.right + 8,
      });
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

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
            onClick={() => {
              onChange(option.id);
              onClose();
            }}
            className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors outline-none hover:bg-white/5 ${
              value === option.id ? "bg-white/10" : ""
            }`}
          >
            {option.icon && (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-700">
                <div className="size-5 text-white">{option.icon}</div>
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
}

// Grid dropdown for many options (e.g., transitions) - 2 columns with scroll
interface GridDropdownProps {
  options: { id: string; label: string; description?: string }[];
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function GridDropdown({
  options,
  value,
  onChange,
  isOpen,
  onClose,
  triggerRef,
}: GridDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = Math.min(400, viewportHeight - 100);

      // Position to the right, but ensure it doesn't go off screen
      let top = rect.top;
      if (top + dropdownHeight > viewportHeight - 20) {
        top = viewportHeight - dropdownHeight - 20;
      }

      setPosition({
        top: Math.max(20, top),
        left: rect.right + 8,
      });
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

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
              onClick={() => {
                onChange(option.id);
                onClose();
              }}
              className={`flex w-full flex-col items-start rounded-lg px-2.5 py-2 text-left transition-colors outline-none hover:bg-white/5 ${
                value === option.id ? "bg-white/10 ring-1 ring-cyan-400/50" : ""
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
}

// Simple dropdown for options without icons (duration, aspect ratio, resolution)
interface SimpleDropdownProps {
  options: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function SimpleDropdown({
  options,
  value,
  onChange,
  isOpen,
  onClose,
  triggerRef,
}: SimpleDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.right + 8,
      });
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={{ top: position.top, left: position.left }}
      className="fixed z-[9999] w-40 rounded-2xl border border-zinc-700 bg-zinc-800 p-2 shadow-xl"
    >
      <div className="flex flex-col gap-1">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              onChange(option.id);
              onClose();
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors outline-none hover:bg-white/5 ${
              value === option.id ? "bg-white/10" : ""
            }`}
          >
            <span className="text-sm font-medium text-white">
              {option.label}
            </span>
            {value === option.id && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="text-cyan-400"
              >
                <path d="M13.7071 4.29289C14.0976 4.68342 14.0976 5.31658 13.7071 5.70711L6.70711 12.7071C6.31658 13.0976 5.68342 13.0976 5.29289 12.7071L2.29289 9.70711C1.90237 9.31658 1.90237 8.68342 2.29289 8.29289C2.68342 7.90237 3.31658 7.90237 3.70711 8.29289L6 10.5858L12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289Z" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}
