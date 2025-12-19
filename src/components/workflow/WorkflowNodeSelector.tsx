"use client";

import { useState } from "react";
import { toast } from "sonner";

// Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.8035 15.8035L21 21"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M19.5 3.75H4.5C4.08579 3.75 3.75 4.08579 3.75 4.5V19.5C3.75 19.9142 4.08579 20.25 4.5 20.25H19.5C19.9142 20.25 20.25 19.9142 20.25 19.5V4.5C20.25 4.08579 19.9142 3.75 19.5 3.75Z"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.25 10.5C9.07843 10.5 9.75 9.82843 9.75 9C9.75 8.17157 9.07843 7.5 8.25 7.5C7.42157 7.5 6.75 8.17157 6.75 9C6.75 9.82843 7.42157 10.5 8.25 10.5Z"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.25 15L15.75 10.5L5.25 21"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PromptIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 5.25V18.75"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.25 8.25V5.25H18.75V8.25"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 18.75H15"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const OutputIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3L12 13.5"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.25 13.5V19.5H3.75V13.5"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.25 6.75L12 3L15.75 6.75"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PreviewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 5.25C4.5 5.25 1.5 12 1.5 12C1.5 12 4.5 18.75 12 18.75C19.5 18.75 22.5 12 22.5 12C22.5 12 19.5 5.25 12 5.25Z"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25C9.92893 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92893 15.75 12 15.75Z"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Kling26Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L2 7L12 12L22 7L12 2Z"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 17L12 22L22 17"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 12L12 17L22 12"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

const Kling25Icon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WanIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.125"
    />
    <path
      d="M9 9L15 15M15 9L9 15"
      stroke="currentColor"
      strokeWidth="1.125"
      strokeLinecap="round"
    />
  </svg>
);

const VideoEditorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect
      x="2"
      y="4"
      width="20"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.125"
    />
    <path d="M2 9H22" stroke="currentColor" strokeWidth="1.125" />
    <path d="M7 4V9" stroke="currentColor" strokeWidth="1.125" />
    <path d="M17 4V9" stroke="currentColor" strokeWidth="1.125" />
    <path d="M10 14L15 17L10 20V14Z" fill="currentColor" />
  </svg>
);

const NanoBananaProIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.125" />
    <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.125" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.125" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

interface NodeItem {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: string;
}

const nodeItems: NodeItem[] = [
  {
    type: "imageInput",
    label: "Image",
    icon: <ImageIcon />,
    category: "Input",
  },
  { type: "prompt", label: "Prompt", icon: <PromptIcon />, category: "Input" },
  {
    type: "kling26",
    label: "Kling 2.6",
    icon: <Kling26Icon />,
    category: "Models",
  },
  {
    type: "kling25Turbo",
    label: "Kling 2.5",
    icon: <Kling25Icon />,
    category: "Models",
  },
  { type: "wan26", label: "Wan 2.6", icon: <WanIcon />, category: "Models" },
  {
    type: "nanoBananaPro",
    label: "Nano Banana",
    icon: <NanoBananaProIcon />,
    category: "Models",
  },
  {
    type: "videoEditor",
    label: "Video Edit",
    icon: <VideoEditorIcon />,
    category: "Editing",
  },
  { type: "output", label: "Output", icon: <OutputIcon />, category: "Output" },
  {
    type: "preview",
    label: "Preview",
    icon: <PreviewIcon />,
    category: "Output",
  },
];

interface WorkflowNodeSelectorProps {
  isOpen: boolean;
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
  onSave?: () => Promise<void>;
}

export default function WorkflowNodeSelector({
  isOpen,
  workflowName,
  onWorkflowNameChange,
  onSave,
}: WorkflowNodeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleNameKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (onSave) {
        await onSave();
        toast.success("Workflow saved");
      }
    }
  };

  const filteredNodes = nodeItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(filteredNodes.map((item) => item.category))];

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className={`absolute top-0 left-14 z-30 h-full overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? "w-60" : "w-0"
      }`}
    >
      <div className="flex h-full w-60 flex-col border-r border-zinc-800 bg-zinc-900">
        {/* Workflow Title */}
        <div className="border-b border-zinc-800 px-3 py-3">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => onWorkflowNameChange(e.target.value)}
            onKeyDown={handleNameKeyDown}
            className="w-full bg-transparent text-sm font-medium text-white placeholder-gray-500 outline-none"
            placeholder="Workflow name"
          />
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5">
            <span className="text-gray-500">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-[10px] text-white placeholder-gray-500 outline-none"
            />
          </div>
        </div>

        {/* Node List */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {categories.map((category) => (
            <div key={category} className="mb-4">
              <span className="mb-2 block text-[9px] font-medium tracking-wider text-gray-500 uppercase">
                {category}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {filteredNodes
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <div
                      key={item.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.type)}
                      className="flex aspect-square cursor-grab flex-col items-center justify-center gap-1.5 rounded border border-zinc-700 bg-zinc-900 text-white transition-colors hover:border-zinc-600 hover:bg-zinc-800 active:cursor-grabbing"
                    >
                      <span className="scale-125">{item.icon}</span>
                      <span className="text-[11px]">{item.label}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
