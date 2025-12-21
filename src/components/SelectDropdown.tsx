"use client";

import { useState, useRef, useEffect, memo, useCallback } from "react";
import {
  ChevronDownIcon,
  CheckIcon,
  aspectRatioIcons,
} from "@/components/icons";

interface SelectDropdownProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  showIcons?: boolean;
  placeholder?: string;
}

export default memo(function SelectDropdown({
  options,
  value,
  onChange,
  icon,
  showIcons = false,
  placeholder = "Select",
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
    },
    [onChange]
  );

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="flex h-10 items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white transition hover:bg-white/10"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDownIcon />
      </button>
      {isOpen && (
        <div className="hide-scrollbar absolute bottom-full left-0 z-50 mb-2 flex max-h-72 min-w-[240px] flex-col overflow-y-auto rounded-xl border border-white/10 bg-black/80 px-1 pt-2 pb-2 shadow-lg backdrop-blur-xl">
          {options.map((option) => {
            const isSelected = option.value === value;
            const optionIcon = showIcons
              ? aspectRatioIcons[option.value]
              : null;

            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                className="cursor-pointer px-1.5 py-1.5 text-sm"
              >
                <div className="group flex w-full items-center gap-1">
                  {showIcons && (
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md p-1 text-white/25 transition group-hover:bg-white/10 ${isSelected ? "bg-white/10" : "bg-transparent"}`}
                    >
                      {optionIcon}
                    </div>
                  )}
                  <div
                    className={`flex h-8 flex-1 items-center justify-between rounded-md px-2 transition group-hover:bg-white/10 ${isSelected ? "bg-white/10" : ""}`}
                  >
                    <span className="text-sm text-white">{option.label}</span>
                    {isSelected && <CheckIcon />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
