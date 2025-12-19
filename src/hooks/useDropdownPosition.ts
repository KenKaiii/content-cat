"use client";

import { useState, useEffect, useRef, RefObject } from "react";

interface UseDropdownPositionOptions {
  isOpen: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  /** Adjust position for viewport overflow */
  adjustForViewport?: boolean;
  /** Maximum height of the dropdown (for viewport adjustment) */
  maxHeight?: number;
}

interface DropdownPosition {
  top: number;
  left: number;
}

interface UseDropdownPositionReturn {
  dropdownRef: RefObject<HTMLDivElement>;
  position: DropdownPosition;
}

export function useDropdownPosition({
  isOpen,
  triggerRef,
  onClose,
  adjustForViewport = false,
  maxHeight = 400,
}: UseDropdownPositionOptions): UseDropdownPositionReturn {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
  });

  // Calculate position when dropdown opens
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();

      if (adjustForViewport) {
        const viewportHeight = window.innerHeight;
        const dropdownHeight = Math.min(maxHeight, viewportHeight - 100);

        let top = rect.top;
        if (top + dropdownHeight > viewportHeight - 20) {
          top = viewportHeight - dropdownHeight - 20;
        }

        setPosition({
          top: Math.max(20, top),
          left: rect.right + 8,
        });
      } else {
        setPosition({
          top: rect.top,
          left: rect.right + 8,
        });
      }
    }
  }, [isOpen, triggerRef, adjustForViewport, maxHeight]);

  // Handle click outside
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

  return {
    dropdownRef: dropdownRef as RefObject<HTMLDivElement>,
    position,
  };
}
