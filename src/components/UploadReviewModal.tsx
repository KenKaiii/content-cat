"use client";

import { useEffect, useState } from "react";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  quality: number; // 0-100
  aspectRatio: number;
  fileKey: string; // unique key based on name + size
}

interface UploadReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFiles: File[];
  onGenerate: (name: string, images: UploadedImage[]) => void;
}

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="h-5 w-5">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.2396 1.75268L16.4645 2.48383C16.7531 3.42168 17.4873 4.15583 18.4251 4.4444L19.1563 4.66937C19.2615 4.70175 19.3333 4.79895 19.3333 4.90902C19.3333 5.01909 19.2615 5.11629 19.1563 5.14866L18.4251 5.37363C17.4873 5.6622 16.7531 6.39636 16.4645 7.3342L16.2396 8.06535C16.2072 8.17056 16.11 8.24235 15.9999 8.24235C15.8898 8.24235 15.7926 8.17056 15.7603 8.06535L15.5353 7.3342C15.2467 6.39636 14.5126 5.6622 13.5747 5.37363L12.8436 5.14866C12.7384 5.11629 12.6666 5.01909 12.6666 4.90902C12.6666 4.79895 12.7384 4.70175 12.8436 4.66937L13.5747 4.4444C14.5126 4.15583 15.2467 3.42168 15.5353 2.48383L15.7603 1.75268C15.7926 1.64747 15.8898 1.57568 15.9999 1.57568C16.11 1.57568 16.2072 1.64747 16.2396 1.75268ZM11.8336 2.07568C12.2478 2.07568 12.5836 2.41147 12.5836 2.82568C12.5836 3.2399 12.2478 3.57568 11.8336 3.57568H5.58358C4.15684 3.57568 3.00025 4.73228 3.00025 6.15902L3.00025 15.3257C3.00025 16.653 4.00123 17.7465 5.28948 17.8925L11.2022 11.9798C12.4714 10.7106 14.5291 10.7106 15.7983 11.9798L17.3336 13.515L17.3336 9.07568C17.3336 8.66147 17.6694 8.32568 18.0836 8.32568C18.4978 8.32568 18.8336 8.66147 18.8336 9.07568L18.8336 15.3257C18.8336 17.5808 17.0054 19.409 14.7502 19.409H5.58358C3.32842 19.409 1.50025 17.5808 1.50025 15.3257L1.50024 6.15902C1.50024 3.90385 3.32842 2.07568 5.58358 2.07568H11.8336ZM12.2628 13.0404L7.39424 17.909H14.7502C16.0775 17.909 17.171 16.908 17.317 15.6198L14.7377 13.0404C14.0543 12.357 12.9462 12.357 12.2628 13.0404ZM9.00025 8.65902C9.00025 8.15276 8.58984 7.74235 8.08358 7.74235C7.57732 7.74235 7.16691 8.15276 7.16691 8.65902C7.16691 9.16528 7.57732 9.57568 8.08358 9.57568C8.58984 9.57568 9.00025 9.16528 9.00025 8.65902ZM8.08358 6.24235C9.41827 6.24235 10.5002 7.32433 10.5002 8.65902C10.5002 9.99371 9.41827 11.0757 8.08358 11.0757C6.74889 11.0757 5.66691 9.99371 5.66691 8.65902C5.66691 7.32433 6.74889 6.24235 8.08358 6.24235Z"
      fill="currentColor"
    />
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="h-3.5 w-3.5">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.81246 3.81246C4.00772 3.6172 4.32431 3.6172 4.51957 3.81246L9.99935 9.29224L15.4791 3.81246C15.6744 3.6172 15.991 3.6172 16.1862 3.81246C16.3815 4.00772 16.3815 4.32431 16.1862 4.51957L10.7065 9.99935L16.1862 15.4791C16.3815 15.6744 16.3815 15.991 16.1862 16.1862C15.991 16.3815 15.6744 16.3815 15.4791 16.1862L9.99935 10.7065L4.51957 16.1862C4.32431 16.3815 4.00772 16.3815 3.81246 16.1862C3.6172 15.991 3.6172 15.6744 3.81246 15.4791L9.29224 9.99935L3.81246 4.51957C3.6172 4.32431 3.6172 4.00772 3.81246 3.81246Z"
      fill="currentColor"
    />
  </svg>
);

const GenerateIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" className="h-5 w-5">
    <path
      d="M9.97085 2.50467C9.8669 2.34577 9.6899 2.25 9.5 2.25C9.31017 2.25 9.1331 2.34577 9.02923 2.50467L6.13424 6.93229L2.09595 4.57663C1.90429 4.46482 1.66483 4.47613 1.48456 4.6055C1.3043 4.73486 1.21692 4.95811 1.26148 5.17547L2.93761 13.3517C3.1343 14.3112 3.97866 15 4.95809 15H14.0419C15.0214 15 15.8658 14.3112 16.0624 13.3517L17.7386 5.17547C17.7831 4.95811 17.6958 4.73486 17.5155 4.6055C17.3352 4.47613 17.0958 4.46482 16.9041 4.57663L12.8658 6.93229L9.97085 2.50467Z"
      fill="currentColor"
    />
  </svg>
);

const MAX_IMAGES = 70;

const getFileKey = (file: File): string =>
  `${file.name}-${file.size}-${file.lastModified}`;

function getCountRating(count: number): {
  label: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
} {
  if (count < 10) {
    return {
      label: "Bad",
      color: "text-red-500",
      gradientFrom: "rgb(194,146,73)",
      gradientTo: "rgb(236,118,55)",
    };
  } else if (count < 20) {
    return {
      label: "Good",
      color: "text-yellow-500",
      gradientFrom: "rgb(194,194,73)",
      gradientTo: "rgb(236,200,55)",
    };
  } else {
    return {
      label: "Excellent",
      color: "text-cyan-400",
      gradientFrom: "rgb(73,194,140)",
      gradientTo: "rgb(209,254,23)",
    };
  }
}

function getQualityRating(avgQuality: number): {
  label: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
} {
  if (avgQuality < 40) {
    return {
      label: "Bad",
      color: "text-red-500",
      gradientFrom: "rgb(194,146,73)",
      gradientTo: "rgb(236,118,55)",
    };
  } else if (avgQuality < 70) {
    return {
      label: "Good",
      color: "text-yellow-500",
      gradientFrom: "rgb(194,194,73)",
      gradientTo: "rgb(236,200,55)",
    };
  } else {
    return {
      label: "Excellent",
      color: "text-cyan-400",
      gradientFrom: "rgb(73,194,140)",
      gradientTo: "rgb(209,254,23)",
    };
  }
}

export default function UploadReviewModal({
  isOpen,
  onClose,
  initialFiles,
  onGenerate,
}: UploadReviewModalProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [characterName, setCharacterName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert files to uploadable images with preview URLs
  useEffect(() => {
    if (initialFiles.length > 0) {
      const loadImages = async () => {
        const seenKeys = new Set<string>();
        const uniqueFiles = initialFiles.filter((file) => {
          const key = getFileKey(file);
          if (seenKeys.has(key)) return false;
          seenKeys.add(key);
          return true;
        });

        const newImages: UploadedImage[] = await Promise.all(
          uniqueFiles.map(async (file, index) => {
            const preview = URL.createObjectURL(file);
            const aspectRatio = await getImageAspectRatio(preview);
            const fileKey = getFileKey(file);
            return {
              id: `${Date.now()}-${index}`,
              file,
              preview,
              quality: Math.floor(Math.random() * 30) + 70,
              aspectRatio,
              fileKey,
            };
          })
        );
        setImages(newImages);
      };
      loadImages();
    }

    return () => {
      // Cleanup preview URLs
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFiles]);

  const getImageAspectRatio = (src: string): Promise<number> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.width / img.height);
      img.onerror = () => resolve(1);
      img.src = src;
    });
  };

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

  const handleAddMoreImages = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files) {
      // Get existing file keys
      const existingKeys = new Set(images.map((img) => img.fileKey));

      // Filter out duplicates
      const seenKeys = new Set<string>();
      const uniqueNewFiles = Array.from(files).filter((file) => {
        const key = getFileKey(file);
        if (existingKeys.has(key) || seenKeys.has(key)) return false;
        seenKeys.add(key);
        return true;
      });

      if (uniqueNewFiles.length > 0) {
        const newImages: UploadedImage[] = await Promise.all(
          uniqueNewFiles.map(async (file, index) => {
            const preview = URL.createObjectURL(file);
            const aspectRatio = await getImageAspectRatio(preview);
            const fileKey = getFileKey(file);
            return {
              id: `${Date.now()}-${index}`,
              file,
              preview,
              quality: Math.floor(Math.random() * 30) + 70,
              aspectRatio,
              fileKey,
            };
          })
        );
        setImages((prev) => [...prev, ...newImages].slice(0, MAX_IMAGES));
      }
    }
    // Reset input value so same file can be selected again
    e.target.value = "";
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0 || !characterName.trim()) return;
    setIsSubmitting(true);
    onGenerate(characterName, images);
  };

  const imageCount = images.length;
  const countPercentage = Math.min((imageCount / MAX_IMAGES) * 100, 100);
  const avgQuality =
    images.length > 0
      ? Math.round(
          images.reduce((sum, img) => sum + img.quality, 0) / images.length
        )
      : 0;

  const countRating = getCountRating(imageCount);
  const qualityRating = getQualityRating(avgQuality);

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
        className={`mx-4 grid h-[90vh] max-h-[700px] w-full max-w-[68rem] grid-rows-[auto_1fr_auto] gap-4 rounded-3xl border border-zinc-700/50 bg-zinc-900 transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Upload More Button */}
        <label className="grid w-full cursor-pointer rounded-t-3xl bg-zinc-800/50 p-3 text-center text-gray-400 transition hover:bg-zinc-800">
          <input
            multiple
            className="sr-only"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
            type="file"
            onChange={handleAddMoreImages}
          />
          <div className="grid justify-center rounded-xl border border-dashed border-transparent p-5">
            <div className="flex items-center justify-center">
              <span className="inline-grid h-12 grid-flow-col items-center justify-center gap-1.5 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 text-sm font-medium text-cyan-400 backdrop-blur-sm transition hover:bg-cyan-400/20">
                <UploadIcon />
                Upload images
              </span>
            </div>
          </div>
        </label>

        {/* Image Gallery */}
        <div className="hide-scrollbar grid grid-cols-2 gap-0 overflow-y-auto px-2 pt-1 pb-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {images.map((img, index) => (
            <div key={img.id} className="w-full">
              <div className="group relative p-2">
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute -top-1 -right-1 z-10 grid h-6 w-6 items-center justify-center rounded-lg border border-zinc-600 bg-zinc-800 text-white transition hover:bg-zinc-700 lg:opacity-0 lg:group-hover:opacity-100"
                >
                  <XIcon />
                </button>
                <figure
                  className="relative overflow-hidden rounded-lg"
                  style={{ aspectRatio: img.aspectRatio }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`uploaded file ${index}`}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                    src={img.preview}
                  />
                </figure>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Form */}
        <form
          onSubmit={handleSubmit}
          className="sticky bottom-4 z-10 grid grid-cols-12 grid-rows-[auto_4rem] gap-2 rounded-2xl border border-zinc-700/50 bg-[rgba(19,19,19,0.9)] p-3 backdrop-blur-lg md:bottom-8 lg:grid-rows-1"
        >
          {/* Stats Section */}
          <div className="relative col-span-12 grid grid-cols-2 items-center lg:col-span-7">
            {/* Images Count */}
            <div className="items-center rounded-l-xl border-y border-l border-zinc-700/50 px-3 py-3 md:px-4">
              <div className="grid grid-flow-row-dense auto-rows-min items-center md:grid-cols-[1fr_auto]">
                <p className="truncate text-xs text-gray-400 md:order-1 md:text-sm">
                  Images count
                </p>
                <div className="grid grid-cols-[auto_1fr] items-center gap-1 md:gap-3">
                  <p
                    className={`font-heading truncate text-xs font-bold uppercase md:text-sm ${countRating.color}`}
                  >
                    {countRating.label}
                  </p>
                  <p className="truncate text-xs text-gray-400 md:text-sm">
                    {imageCount} of {MAX_IMAGES}
                  </p>
                </div>
              </div>
              <div
                role="progressbar"
                className="relative mt-1 w-full rounded-full bg-zinc-700 p-px md:p-1"
              >
                <div
                  className="h-1.5 rounded-full transition-all duration-300 md:h-3"
                  style={{
                    width: `${countPercentage}%`,
                    background: `linear-gradient(to right, ${countRating.gradientFrom}, ${countRating.gradientTo})`,
                  }}
                />
              </div>
            </div>

            {/* Divider */}
            <hr className="absolute top-1/2 left-1/2 h-10 w-px -translate-x-1/2 -translate-y-1/2 border-none bg-zinc-700/50" />

            {/* Average Quality */}
            <div className="items-center rounded-r-xl border-y border-r border-zinc-700/50 px-3 py-3 md:px-4">
              <div className="grid grid-flow-row-dense auto-rows-min items-center md:grid-cols-[1fr_auto]">
                <p className="truncate text-xs text-gray-400 md:order-1 md:text-sm">
                  Average quality
                </p>
                <div className="grid grid-cols-[auto_1fr] items-center gap-1 md:gap-3">
                  <p
                    className={`font-heading truncate text-xs font-bold uppercase md:text-sm ${qualityRating.color}`}
                  >
                    {qualityRating.label}
                  </p>
                </div>
              </div>
              <div
                role="progressbar"
                className="relative mt-1 w-full rounded-full bg-zinc-700 p-px md:p-1"
              >
                <div
                  className="h-1.5 rounded-full transition-all duration-300 md:h-3"
                  style={{
                    width: `${avgQuality}%`,
                    background: `linear-gradient(to right, ${qualityRating.gradientFrom}, ${qualityRating.gradientTo})`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Name Input and Generate Button */}
          <div className="col-span-12 grid grid-cols-12 gap-2 lg:col-span-5">
            <label className="col-span-6 flex flex-col justify-center gap-1 rounded-xl border border-zinc-700/50 px-3 lg:col-span-7">
              <span className="h-4 text-xs text-gray-400 md:text-sm">
                Enter name
              </span>
              <input
                required
                placeholder="Type here..."
                className="font-heading h-5 w-full bg-transparent text-xs font-bold text-white outline-none placeholder:text-zinc-500 md:text-sm"
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                name="name"
              />
            </label>
            <button
              type="submit"
              disabled={
                images.length === 0 || !characterName.trim() || isSubmitting
              }
              className="col-span-6 inline-grid h-full grid-flow-col items-center justify-center gap-2 rounded-xl border border-cyan-400 bg-cyan-400 px-4 text-sm font-medium text-black transition-all duration-300 hover:bg-cyan-500 disabled:cursor-not-allowed disabled:border-zinc-600 disabled:bg-zinc-700 disabled:text-zinc-400 lg:col-span-5"
            >
              Generate
              <GenerateIcon />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
