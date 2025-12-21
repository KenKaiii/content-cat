"use client";

import { useEffect } from "react";
import Image from "next/image";
import { CheckIcon, CloseIcon, UploadIcon } from "./icons";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected?: (files: File[]) => void;
}

const goodPhotos = [
  { id: 1, image: "/images/good-1.jpg" },
  { id: 2, image: "/images/good-2.jpg" },
  { id: 3, image: "/images/good-3.jpg" },
  { id: 4, image: "/images/good-4.jpg" },
  { id: 5, image: "/images/good-5.jpg" },
];

const badPhotos = [
  { id: 1, image: "/images/bad-1.jpg" },
  { id: 2, image: "/images/bad-2.jpg" },
  { id: 3, image: "/images/bad-3.jpg" },
  { id: 4, image: "/images/bad-4.jpg" },
  { id: 5, image: "/images/bad-5.jpg" },
];

export default function UploadModal({
  isOpen,
  onClose,
  onFilesSelected,
}: UploadModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-200 ${
        isOpen
          ? "opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      style={{ willChange: "opacity" }}
      onClick={onClose}
    >
      <div
        className={`mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-3xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl transition-all duration-200 md:p-8 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={{ willChange: "transform, opacity" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Good Photos Section */}
        <section className="grid w-full grid-rows-[auto_1fr] gap-4">
          <div className="grid grid-cols-[auto_1fr] items-start gap-3 px-4">
            <div className="grid h-8 w-8 items-center justify-center rounded-xl border border-pink-400/20 bg-pink-400/10 text-pink-400">
              <CheckIcon />
            </div>
            <div className="grid grid-flow-row auto-rows-min">
              <p className="font-heading text-sm font-bold text-white uppercase">
                Upload 6-8 photos for best results
              </p>
              <p className="text-sm text-zinc-300">
                Upload high-quality images. Show different angles, clear facial
                expressions, and good lighting
              </p>
            </div>
          </div>
          <div className="grid auto-cols-min grid-flow-col gap-2 overflow-x-auto px-4 md:grid-cols-5">
            {goodPhotos.map((photo) => (
              <article
                key={photo.id}
                className="relative grid aspect-[0.8] w-24 items-end justify-start gap-3 overflow-hidden rounded-xl border-2 border-white p-2 md:w-full"
              >
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-pink-400/50 to-transparent to-50%" />
                <Image
                  src={photo.image}
                  alt={`Good reference photo ${photo.id}`}
                  fill
                  sizes="(max-width: 768px) 96px, 20vw"
                  className="object-cover"
                />
                <div className="z-20 grid h-6 w-6 items-center justify-center rounded-lg bg-pink-400 text-black">
                  <CheckIcon />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Bad Photos Section */}
        <section className="grid w-full grid-rows-[auto_1fr] gap-4">
          <div className="grid grid-cols-[auto_1fr] items-start gap-3 px-4">
            <div className="grid h-8 w-8 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-500">
              <CloseIcon />
            </div>
            <div className="grid grid-flow-row auto-rows-min">
              <p className="font-heading text-sm font-bold text-white uppercase">
                Avoid These Types of Photos
              </p>
              <p className="text-sm text-zinc-300">
                No duplicates, group shots, pets, nudes, filters, face-covering
                accessories, or masks
              </p>
            </div>
          </div>
          <div className="grid auto-cols-min grid-flow-col gap-2 overflow-x-auto px-4 md:grid-cols-5">
            {badPhotos.map((photo) => (
              <article
                key={photo.id}
                className="relative grid aspect-[0.8] w-24 items-end justify-start gap-3 overflow-hidden rounded-xl border-2 border-white p-2 md:w-full"
              >
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-red-500/40 to-transparent to-50%" />
                <Image
                  src={photo.image}
                  alt={`Bad reference photo ${photo.id}`}
                  fill
                  sizes="(max-width: 768px) 96px, 20vw"
                  className="object-cover"
                />
                <div className="z-20 grid h-6 w-6 items-center justify-center rounded-lg bg-red-500 text-white">
                  <CloseIcon />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Upload Button */}
        <div className="flex justify-center">
          <label className="inline-grid h-12 cursor-pointer grid-flow-col items-center justify-center gap-2 rounded-xl bg-pink-400 px-6 font-medium text-black transition-all duration-300 hover:bg-pink-500 md:h-14 md:w-48">
            <UploadIcon />
            Upload images
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  onFilesSelected?.(Array.from(files));
                }
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
