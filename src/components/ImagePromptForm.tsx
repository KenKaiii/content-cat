"use client";

import { useState, useRef, useEffect } from "react";

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <path
      fill="currentColor"
      d="M9.16602 9.16602V4.16602H10.8327V9.16602H15.8327V10.8327H10.8327V15.8327H9.16602V10.8327H4.16602V9.16602H9.16602Z"
    />
  </svg>
);

const MinusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="h-5 w-5">
    <path
      fill="currentColor"
      d="M4.16602 9.16602H15.8327V10.8327H4.16602V9.16602Z"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.81344 7.97994C4.0087 7.78468 4.32528 7.78468 4.52055 7.97994L10.0003 13.4597L15.4801 7.97994C15.6754 7.78468 15.9919 7.78468 16.1872 7.97994C16.3825 8.1752 16.3825 8.49179 16.1872 8.68705L10.3539 14.5204L10.0003 14.8739L9.64677 14.5204L3.81344 8.68705C3.61818 8.49179 3.61818 8.1752 3.81344 7.97994Z"
      fill="currentColor"
    />
  </svg>
);

const DrawIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      fill="none"
      d="M7.55929 15.125C6.80178 14.9323 5.23971 14.4539 3.55888 12.743C0.749296 9.88327 0.0300494 5.97875 1.95239 4.02207C3.53188 2.41436 6.59253 2.53853 9.125 4.25M11.75 6.875C13.9356 9.44282 14.5373 11.8324 12.8604 13.1979C11.6042 14.2208 10.0146 13.0379 9.08705 12.126M6.875 9.125H8.71079C8.976 9.125 9.23036 9.01964 9.41789 8.83211L14.4156 3.83439C14.807 3.44298 14.806 2.80805 14.4133 2.4179L13.5684 1.57841C13.1772 1.1897 12.5451 1.1911 12.1556 1.58154L7.16703 6.58225C6.98002 6.76972 6.875 7.02371 6.875 7.2885V9.125Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="h-4 w-4">
    <path
      d="M11.8525 4.21651L11.7221 3.2387C11.6906 3.00226 11.4889 2.82568 11.2504 2.82568C11.0118 2.82568 10.8102 3.00226 10.7786 3.23869L10.6483 4.21651C10.2658 7.0847 8.00939 9.34115 5.14119 9.72358L4.16338 9.85396C3.92694 9.88549 3.75037 10.0872 3.75037 10.3257C3.75037 10.5642 3.92694 10.7659 4.16338 10.7974L5.14119 10.9278C8.00938 11.3102 10.2658 13.5667 10.6483 16.4349L10.7786 17.4127C10.8102 17.6491 11.0118 17.8257 11.2504 17.8257C11.4889 17.8257 11.6906 17.6491 11.7221 17.4127L11.8525 16.4349C12.2349 13.5667 14.4913 11.3102 17.3595 10.9278L18.3374 10.7974C18.5738 10.7659 18.7504 10.5642 18.7504 10.3257C18.7504 10.0872 18.5738 9.88549 18.3374 9.85396L17.3595 9.72358C14.4913 9.34115 12.2349 7.0847 11.8525 4.21651Z"
      fill="currentColor"
    />
    <path
      d="M4.6519 14.7568L4.82063 14.2084C4.84491 14.1295 4.91781 14.0757 5.00037 14.0757C5.08292 14.0757 5.15582 14.1295 5.1801 14.2084L5.34883 14.7568C5.56525 15.4602 6.11587 16.0108 6.81925 16.2272L7.36762 16.3959C7.44652 16.4202 7.50037 16.4931 7.50037 16.5757C7.50037 16.6582 7.44652 16.7311 7.36762 16.7554L6.81926 16.9241C6.11587 17.1406 5.56525 17.6912 5.34883 18.3946L5.1801 18.9429C5.15582 19.0218 5.08292 19.0757 5.00037 19.0757C4.91781 19.0757 4.84491 19.0218 4.82063 18.9429L4.65191 18.3946C4.43548 17.6912 3.88486 17.1406 3.18147 16.9241L2.63311 16.7554C2.55421 16.7311 2.50037 16.6582 2.50037 16.5757C2.50037 16.4931 2.55421 16.4202 2.63311 16.3959L3.18148 16.2272C3.88486 16.0108 4.43548 15.4602 4.6519 14.7568Z"
      fill="currentColor"
    />
  </svg>
);

const AutoIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" className="h-4 w-4">
    <path
      d="M15.167 2.20801C15.4429 2.20818 15.6668 2.43212 15.667 2.70801C15.667 2.98404 15.443 3.20783 15.167 3.20801H7.04199C4.92512 3.20801 3.20934 4.92422 3.20898 7.04102V18.958C3.20899 21.0751 4.9249 22.791 7.04199 22.791H18.959C21.0096 22.7907 22.6845 21.1805 22.7871 19.1553L22.792 18.958V10.833C22.7922 10.557 23.016 10.333 23.292 10.333C23.5679 10.3332 23.7918 10.5571 23.792 10.833V18.958L23.7861 19.207C23.6566 21.7605 21.5446 23.7907 18.959 23.791H7.04199C4.37262 23.791 2.20899 21.6274 2.20898 18.958V7.04102C2.20934 4.37194 4.37283 2.20801 7.04199 2.20801H15.167ZM20.583 1.08301C20.7261 1.08301 20.8524 1.17674 20.8945 1.31348L21.1875 2.26367C21.5626 3.48287 22.5171 4.43736 23.7363 4.8125L24.6865 5.10547C24.8233 5.14757 24.917 5.27391 24.917 5.41699C24.9169 5.55995 24.8232 5.68647 24.6865 5.72852L23.7363 6.02051C22.5172 6.39563 21.5627 7.35019 21.1875 8.56934L20.8945 9.51953C20.8524 9.6563 20.7261 9.75 20.583 9.75C20.44 9.74986 20.3135 9.65619 20.2715 9.51953L19.9795 8.56934C19.6044 7.35015 18.6498 6.39565 17.4307 6.02051L16.4805 5.72852C16.3438 5.68647 16.2501 5.55995 16.25 5.41699C16.25 5.2739 16.3437 5.14755 16.4805 5.10547L17.4307 4.8125C18.6498 4.43734 19.6044 3.48283 19.9795 2.26367L20.2715 1.31348C20.3135 1.17681 20.44 1.08315 20.583 1.08301Z"
      fill="currentColor"
    />
  </svg>
);

const modelOptions = [
  { value: "nano_banana_2", label: "Nano Banana Pro" },
  { value: "nano_banana", label: "Nano Banana" },
  { value: "soul", label: "Soul" },
  { value: "face_swap", label: "Face Swap" },
  { value: "character_swap", label: "Character Swap" },
  { value: "seedream_v4_5", label: "Seedream 4.5" },
  { value: "seedream", label: "Seedream 4.0" },
  { value: "flux_2", label: "FLUX.2 Pro" },
  { value: "flux_2_flex", label: "FLUX.2 Flex" },
];

const aspectRatioOptions = [
  { value: "auto", label: "Auto" },
  { value: "1:1", label: "1:1" },
  { value: "4:3", label: "4:3" },
  { value: "16:9", label: "16:9" },
  { value: "21:9", label: "21:9" },
  { value: "9:16", label: "9:16" },
  { value: "3:4", label: "3:4" },
];

const CheckIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    className="h-4 w-4 text-gray-400"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.99999 15.1715L19.192 5.97852L20.607 7.39252L9.99999 17.9995L3.63599 11.6355L5.04999 10.2215L9.99999 15.1715Z"
      fill="currentColor"
    />
  </svg>
);

const AspectRatioIcon1x1 = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    className="h-5 w-5 text-white"
  >
    <path
      d="M10.5 3C11.8807 3 13 4.11929 13 5.5V10.5C13 11.8807 11.8807 13 10.5 13H5.5C4.11929 13 3 11.8807 3 10.5V5.5C3 4.11929 4.11929 3 5.5 3H10.5ZM5.5 4C4.67157 4 4 4.67157 4 5.5V10.5C4 11.3284 4.67157 12 5.5 12H10.5C11.3284 12 12 11.3284 12 10.5V5.5C12 4.67157 11.3284 4 10.5 4H5.5Z"
      fill="currentColor"
    />
  </svg>
);

const AspectRatioIcon4x3 = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    className="h-5 w-5 text-white"
  >
    <path
      d="M12.5 3C13.8807 3 15 4.11929 15 5.5V11.5C15 12.8807 13.8807 14 12.5 14H3.5C2.11929 14 1 12.8807 1 11.5V5.5C1 4.11929 2.11929 3 3.5 3H12.5ZM3.5 4C2.67157 4 2 4.67157 2 5.5V11.5C2 12.3284 2.67157 13 3.5 13H12.5C13.3284 13 14 12.3284 14 11.5V5.5C14 4.67157 13.3284 4 12.5 4H3.5Z"
      fill="currentColor"
    />
  </svg>
);

const AspectRatioIcon16x9 = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    className="h-5 w-5 text-white"
  >
    <path
      d="M13.833 3.5C14.8454 3.5 15.6658 4.32064 15.666 5.33301V10.667C15.6658 11.6794 14.8454 12.5 13.833 12.5H3.16602C2.1539 12.4996 1.33318 11.6791 1.33301 10.667V5.33301C1.33318 4.32085 2.1539 3.50035 3.16602 3.5H13.833ZM3.16602 4.5C2.70619 4.50035 2.33318 4.87314 2.33301 5.33301V10.667C2.33318 11.1269 2.70619 11.4996 3.16602 11.5H13.833C14.2931 11.5 14.6658 11.1271 14.666 10.667V5.33301C14.6658 4.87292 14.2931 4.5 13.833 4.5H3.16602Z"
      fill="currentColor"
    />
  </svg>
);

const AspectRatioIcon9x16 = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    className="h-5 w-5 text-white"
  >
    <path
      d="M10.7412 1.0127C12.002 1.14057 12.9863 2.20547 12.9863 3.5V12.5C12.9863 13.8806 11.8669 14.9998 10.4863 15H6.5C5.11938 14.9999 4 13.8806 4 12.5V3.5C4 2.11936 5.11938 1.00011 6.5 1H10.4863L10.7412 1.0127ZM6.5 2C5.67167 2.00011 5 2.67164 5 3.5V12.5C5 13.3284 5.67167 13.9999 6.5 14H10.4863C11.3146 13.9998 11.9863 13.3283 11.9863 12.5V3.5C11.9863 2.72348 11.3959 2.0848 10.6396 2.00781L10.4863 2H6.5Z"
      fill="currentColor"
    />
  </svg>
);

const AspectRatioIcon3x4 = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    className="h-5 w-5 text-white"
  >
    <path
      d="M13 12.5C13 13.8807 11.8807 15 10.5 15L4.5 15C3.11929 15 2 13.8807 2 12.5L2 3.5C2 2.11929 3.11929 1 4.5 1L10.5 1C11.8807 1 13 2.11929 13 3.5L13 12.5ZM12 3.5C12 2.67157 11.3284 2 10.5 2L4.5 2C3.67157 2 3 2.67157 3 3.5L3 12.5C3 13.3284 3.67157 14 4.5 14L10.5 14C11.3284 14 12 13.3284 12 12.5L12 3.5Z"
      fill="currentColor"
    />
  </svg>
);

const aspectRatioIcons: Record<string, React.ReactNode> = {
  auto: <AutoIcon />,
  "1:1": <AspectRatioIcon1x1 />,
  "4:3": <AspectRatioIcon4x3 />,
  "16:9": <AspectRatioIcon16x9 />,
  "21:9": <AspectRatioIcon16x9 />,
  "9:16": <AspectRatioIcon9x16 />,
  "3:4": <AspectRatioIcon3x4 />,
};

interface SelectDropdownProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  showIcons?: boolean;
}

function SelectDropdown({
  options,
  value,
  onChange,
  icon,
  showIcons = false,
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

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 items-center justify-between gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-3 text-sm text-white transition hover:bg-zinc-700/50"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{selectedOption?.label || "Select"}</span>
        </div>
        <ChevronDownIcon />
      </button>
      {isOpen && (
        <div className="hide-scrollbar absolute bottom-full left-0 z-50 mb-2 flex max-h-72 min-w-[240px] flex-col overflow-y-auto rounded-xl border border-zinc-700/50 bg-zinc-900 px-1 pt-2 pb-2 shadow-lg">
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
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
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
}

interface ImagePromptFormProps {
  onSubmit?: (data: {
    prompt: string;
    model: string;
    count: number;
    aspectRatio: string;
  }) => void;
}

export default function ImagePromptForm({ onSubmit }: ImagePromptFormProps) {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("nano_banana");
  const [imageCount, setImageCount] = useState(1);
  const [aspectRatio, setAspectRatio] = useState("auto");
  const maxImages = 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ prompt, model, count: imageCount, aspectRatio });
  };

  const incrementCount = () => {
    setImageCount((prev) => Math.min(prev + 1, maxImages));
  };

  const decrementCount = () => {
    setImageCount((prev) => Math.max(prev - 1, 1));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed inset-x-1/2 bottom-4 z-20 hidden w-full -translate-x-1/2 rounded-[2rem] border border-zinc-700/50 bg-[#131313E5] p-[22px] backdrop-blur-[20.9px] md:block lg:max-w-[65rem] lg:min-w-[1000px]"
    >
      <fieldset className="relative z-20 flex gap-3">
        {/* Left section - Prompt input and controls */}
        <div className="min-h-0 min-w-0 flex-1 space-y-2">
          {/* Prompt row */}
          <div className="flex gap-3">
            <button
              type="button"
              className="relative -top-[5.5px] grid h-8 w-8 shrink-0 items-center justify-center rounded-[0.625rem] border border-zinc-700/50 bg-zinc-800/50 text-white transition hover:bg-cyan-400/10 hover:text-cyan-400"
            >
              <PlusIcon />
            </button>
            <textarea
              name="prompt"
              placeholder="Describe the scene you imagine"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="hide-scrollbar h-10 min-h-[40px] w-full resize-none rounded-none border-none bg-transparent p-0 text-[15px] text-white placeholder:text-gray-500 focus:outline-none"
            />
          </div>

          {/* Controls row */}
          <div className="flex h-9 items-center gap-2">
            {/* Model selector */}
            <SelectDropdown
              options={modelOptions}
              value={model}
              onChange={setModel}
            />

            {/* Image count selector */}
            <div className="flex h-10 items-center gap-1 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-3">
              <button
                type="button"
                onClick={decrementCount}
                disabled={imageCount <= 1}
                className="text-gray-400 transition-colors hover:text-white disabled:opacity-40 disabled:hover:text-gray-400"
              >
                <MinusIcon />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-white">
                {imageCount}
                <span className="text-gray-400">/{maxImages}</span>
              </span>
              <button
                type="button"
                onClick={incrementCount}
                disabled={imageCount >= maxImages}
                className="text-gray-400 transition-colors hover:text-white disabled:opacity-40 disabled:hover:text-gray-400"
              >
                <PlusIcon />
              </button>
            </div>

            {/* Aspect ratio selector */}
            <SelectDropdown
              options={aspectRatioOptions}
              value={aspectRatio}
              onChange={setAspectRatio}
              icon={<AutoIcon />}
              showIcons
            />

            {/* Draw button */}
            <button
              type="button"
              className="flex h-10 cursor-pointer items-center gap-1 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-3 text-sm font-medium text-white transition hover:bg-zinc-700/50"
            >
              <DrawIcon />
              Draw
            </button>
          </div>
        </div>

        {/* Right section - Generate button */}
        <aside className="flex h-[84px] items-end justify-end gap-3 self-end">
          <button
            type="submit"
            className="inline-grid h-full w-36 grid-flow-col items-center justify-center gap-2 rounded-xl bg-cyan-400 px-2.5 text-sm font-semibold text-black transition hover:bg-cyan-500 disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Generate</span>
              <div className="flex items-center gap-0.5">
                <SparkleIcon />
                <span>{imageCount}</span>
              </div>
            </div>
          </button>
        </aside>
      </fieldset>
    </form>
  );
}
