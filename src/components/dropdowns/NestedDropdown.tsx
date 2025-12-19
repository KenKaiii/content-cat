"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useDropdownPosition } from "@/hooks/useDropdownPosition";
import { ChevronRightIcon, DropdownCheckIcon } from "./DropdownIcons";
import type { BaseDropdownProps, NestedDropdownGroup } from "./types";

interface NestedDropdownProps extends BaseDropdownProps {
  groups: NestedDropdownGroup[];
}

export function NestedDropdown({
  groups,
  value,
  onChange,
  isOpen,
  onClose,
  triggerRef,
}: NestedDropdownProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [subMenuPosition, setSubMenuPosition] = useState({ top: 0, left: 0 });

  // Find which group contains the current value
  const currentGroup = groups.find((g) =>
    g.options.some((o) => o.id === value)
  );

  const handleClose = () => {
    onClose();
    setActiveGroup(null);
  };

  const { dropdownRef, position } = useDropdownPosition({
    isOpen,
    triggerRef,
    onClose: handleClose,
  });

  // Set active group when dropdown opens with a selected value
  const activeGroupOnOpen = isOpen && currentGroup ? currentGroup.id : null;
  if (
    activeGroupOnOpen &&
    activeGroup !== activeGroupOnOpen &&
    activeGroup === null
  ) {
    setActiveGroup(activeGroupOnOpen);
  }

  const handleGroupHover = (groupId: string) => {
    setActiveGroup(groupId);
    setSubMenuPosition({
      top: position.top,
      left: position.left + 192 + 8, // w-48 (192px) + 8px gap
    });
  };

  if (!isOpen) return null;

  const activeGroupData = groups.find((g) => g.id === activeGroup);

  return createPortal(
    <div ref={dropdownRef} className="fixed z-[9999]">
      {/* Main menu - Provider selection */}
      <div
        style={{ top: position.top, left: position.left }}
        className="fixed w-48 rounded-2xl border border-zinc-700 bg-zinc-800 p-2 shadow-xl"
      >
        <div className="flex flex-col gap-1">
          {groups.map((group) => {
            const isActive = activeGroup === group.id;
            const hasSelectedOption = group.options.some((o) => o.id === value);

            return (
              <button
                key={group.id}
                onMouseEnter={() => handleGroupHover(group.id)}
                className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors outline-none ${
                  isActive
                    ? "bg-white/10"
                    : hasSelectedOption
                      ? "bg-cyan-400/10"
                      : "hover:bg-white/5"
                }`}
              >
                {group.icon && (
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                      hasSelectedOption ? "bg-cyan-400/20" : "bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`size-5 ${hasSelectedOption ? "text-cyan-400" : "text-white"}`}
                    >
                      {group.icon}
                    </div>
                  </div>
                )}
                <span className="flex-1 text-sm font-medium text-white">
                  {group.label}
                </span>
                <ChevronRightIcon />
              </button>
            );
          })}
        </div>
      </div>

      {/* Submenu - Model options */}
      {activeGroupData && (
        <div
          style={{ top: subMenuPosition.top, left: subMenuPosition.left }}
          className="fixed w-72 rounded-2xl border border-zinc-700 bg-zinc-800 p-2 shadow-xl"
        >
          <div className="flex flex-col gap-1">
            {activeGroupData.options.map((option) => {
              const isSelected = value === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => {
                    onChange(option.id);
                    handleClose();
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors outline-none hover:bg-white/5 ${
                    isSelected ? "bg-cyan-400/10 ring-1 ring-cyan-400/30" : ""
                  }`}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p
                      className={`text-sm font-medium ${isSelected ? "text-cyan-400" : "text-white"}`}
                    >
                      {option.label}
                    </p>
                    {option.description && (
                      <p className="text-xs text-gray-400">
                        {option.description}
                      </p>
                    )}
                    {option.badges && option.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {option.badges.map((badge, idx) => {
                          const badgeData =
                            typeof badge === "string"
                              ? { label: badge }
                              : badge;
                          return (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded bg-zinc-700/80 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300"
                            >
                              {badgeData.icon && (
                                <span className="size-3 text-zinc-400">
                                  {badgeData.icon}
                                </span>
                              )}
                              {badgeData.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {isSelected && <DropdownCheckIcon />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
