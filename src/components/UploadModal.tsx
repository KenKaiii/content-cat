"use client";

import { useEffect } from "react";
import Image from "next/image";

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

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" className="h-4 w-4">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.99999 15.1715L19.192 5.97852L20.607 7.39252L9.99999 17.9995L3.63599 11.6355L5.04999 10.2215L9.99999 15.1715Z"
      fill="currentColor"
    />
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="h-4 w-4">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.81246 3.81246C4.00772 3.6172 4.32431 3.6172 4.51957 3.81246L9.99935 9.29224L15.4791 3.81246C15.6744 3.6172 15.991 3.6172 16.1862 3.81246C16.3815 4.00772 16.3815 4.32431 16.1862 4.51957L10.7065 9.99935L16.1862 15.4791C16.3815 15.6744 16.3815 15.991 16.1862 16.1862C15.991 16.3815 15.6744 16.3815 15.4791 16.1862L9.99935 10.7065L4.51957 16.1862C4.32431 16.3815 4.00772 16.3815 3.81246 16.1862C3.6172 15.991 3.6172 15.6744 3.81246 15.4791L9.29224 9.99935L3.81246 4.51957C3.6172 4.32431 3.6172 4.00772 3.81246 3.81246Z"
      fill="currentColor"
    />
  </svg>
);

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="h-5 w-5">
    <mask
      id="mask0"
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="20"
      height="21"
    >
      <rect y="0.357422" width="20" height="20" fill="#D9D9D9" />
    </mask>
    <g mask="url(#mask0)">
      <path
        d="M7.49984 12.0244H15.8332L12.9582 8.27441L11.0415 10.7744L9.74984 9.10775L7.49984 12.0244ZM6.6665 15.3577C6.20817 15.3577 5.81581 15.1946 5.48942 14.8682C5.16303 14.5418 4.99984 14.1494 4.99984 13.6911V3.69108C4.99984 3.23275 5.16303 2.84039 5.48942 2.514C5.81581 2.18761 6.20817 2.02441 6.6665 2.02441H16.6665C17.1248 2.02441 17.5172 2.18761 17.8436 2.514C18.17 2.84039 18.3332 3.23275 18.3332 3.69108V13.6911C18.3332 14.1494 18.17 14.5418 17.8436 14.8682C17.5172 15.1946 17.1248 15.3577 16.6665 15.3577H6.6665ZM6.6665 13.6911H16.6665V3.69108H6.6665V13.6911ZM3.33317 18.6911C2.87484 18.6911 2.48248 18.5279 2.15609 18.2015C1.8297 17.8751 1.6665 17.4827 1.6665 17.0244V5.35775H3.33317V17.0244H14.9998V18.6911H3.33317ZM6.6665 3.69108H16.6665V13.6911H6.6665V3.69108Z"
        fill="currentColor"
      />
    </g>
  </svg>
);

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
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen
          ? "visible bg-black/80 opacity-100 backdrop-blur-sm"
          : "invisible opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-3xl border border-zinc-700/50 bg-zinc-900 p-6 transition-all duration-300 md:p-8 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Good Photos Section */}
        <section className="grid w-full grid-rows-[auto_1fr] gap-4">
          <div className="grid grid-cols-[auto_1fr] items-start gap-3 px-4">
            <div className="grid h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
              <CheckIcon />
            </div>
            <div className="grid grid-flow-row auto-rows-min">
              <p className="font-heading text-sm font-bold text-white uppercase">
                Upload 20+ photos for best results
              </p>
              <p className="text-sm text-gray-400">
                Upload high-quality images of one person. The more images you
                provide, the better the result - show different angles, clear
                facial expressions, and consistent identity
              </p>
            </div>
          </div>
          <div className="grid auto-cols-min grid-flow-col gap-2 overflow-x-auto px-4 md:grid-cols-5">
            {goodPhotos.map((photo) => (
              <article
                key={photo.id}
                className="relative grid aspect-[0.8] w-24 items-end justify-start gap-3 overflow-hidden rounded-xl border-2 border-white p-2 md:w-full"
              >
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-cyan-400/50 to-transparent to-50%" />
                <Image
                  src={photo.image}
                  alt={`Good reference photo ${photo.id}`}
                  fill
                  className="object-cover"
                />
                <div className="z-20 grid h-6 w-6 items-center justify-center rounded-lg bg-cyan-400 text-black">
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
              <XIcon />
            </div>
            <div className="grid grid-flow-row auto-rows-min">
              <p className="font-heading text-sm font-bold text-white uppercase">
                Avoid These Types of Photos
              </p>
              <p className="text-sm text-gray-400">
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
                  className="object-cover"
                />
                <div className="z-20 grid h-6 w-6 items-center justify-center rounded-lg bg-red-500 text-white">
                  <XIcon />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Upload Button */}
        <div className="flex justify-center">
          <label className="inline-grid h-12 cursor-pointer grid-flow-col items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 font-medium text-black transition-all duration-300 hover:bg-cyan-500 md:h-14 md:w-48">
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
