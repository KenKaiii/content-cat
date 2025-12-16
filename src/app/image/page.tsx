"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Slider from "@/components/Slider";
import ImagePromptForm from "@/components/ImagePromptForm";

export default function ImagePage() {
  const [zoomLevel, setZoomLevel] = useState(3);

  const handleGenerate = (data: {
    prompt: string;
    model: string;
    count: number;
    aspectRatio: string;
  }) => {
    console.log("Generating image:", data);
    // TODO: Handle image generation
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0a0a]">
      <Header />
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {/* Top Controls */}
        <div className="z-10 container flex justify-end">
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 md:flex">
              <Slider
                min={0}
                max={4}
                value={zoomLevel}
                onChange={setZoomLevel}
              />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div
          id="soul-feed-scroll"
          className="hide-scrollbar min-h-0 flex-1 overflow-auto pb-40"
        >
          <div className="flex h-full w-full items-center justify-center">
            {/* Empty State */}
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="grid h-32 w-52 items-center justify-center rounded-xl bg-zinc-800/50">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-zinc-600"
                >
                  <path
                    d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="font-heading text-center text-2xl font-bold text-white uppercase">
                Nano Banana Pro
              </h2>
              <p className="text-center text-sm text-gray-400">
                Create stunning, high-aesthetic images in seconds
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Prompt Form */}
      <ImagePromptForm onSubmit={handleGenerate} />
    </div>
  );
}
