"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import SelectDropdown from "@/components/SelectDropdown";
import {
  PlusIcon,
  MinusIcon,
  SparkleIcon,
  CloseIcon,
  ResolutionIcon,
  FormatIcon,
  AutoIcon,
  aspectRatioIcons,
  ImageAddIcon,
} from "@/components/icons";
import {
  modelOptions,
  aspectRatioOptions,
  resolutionOptions,
  outputFormatOptions,
  MAX_REFERENCE_IMAGES,
  MAX_IMAGE_SIZE_MB,
  MAX_IMAGES_PER_GENERATION,
} from "@/lib/constants/image-form";
import { compressImage } from "@/lib/utils/image-compression";
import type {
  SavedCharacter,
  SavedProduct,
  ReferenceImage,
} from "@/types/entities";

interface ImagePromptFormProps {
  onSubmit?: (data: {
    prompt: string;
    model: string;
    count: number;
    aspectRatio: string;
    resolution: string;
    outputFormat: string;
    referenceImages: string[];
  }) => void;
  initialPrompt?: string;
  initialModel?: string;
  initialSubModel?: string;
  recreateData?: {
    prompt: string;
  } | null;
  editData?: {
    imageUrl: string;
  } | null;
}

export default function ImagePromptForm({
  onSubmit,
  initialPrompt = "",
  initialModel,
  initialSubModel,
  recreateData,
  editData,
}: ImagePromptFormProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [model, setModel] = useState(initialModel || "nano_banana_2");
  const [subModel, setSubModel] = useState(initialSubModel || "");
  const [ugcCharacter, setUgcCharacter] = useState("");
  const [ugcProduct, setUgcProduct] = useState("");
  const [imageCount, setImageCount] = useState(1);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [resolution, setResolution] = useState("1K");
  const [outputFormat, setOutputFormat] = useState("png");
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>([]);
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxImages = MAX_IMAGES_PER_GENERATION;

  // Auto-resize textarea
  const autoResizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "40px";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  // Resize textarea when prompt changes programmatically
  useEffect(() => {
    autoResizeTextarea();
  }, [prompt, autoResizeTextarea]);

  // Fetch saved characters and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [charsRes, prodsRes] = await Promise.all([
          fetch("/api/characters"),
          fetch("/api/products"),
        ]);
        if (charsRes.ok) {
          const chars = await charsRes.json();
          setSavedCharacters(chars);
        }
        if (prodsRes.ok) {
          const prods = await prodsRes.json();
          setSavedProducts(prods);
        }
      } catch (error) {
        console.error("Failed to fetch characters/products:", error);
      }
    };
    fetchData();
  }, []);

  // Build dynamic options for characters and products
  const characterOptions = savedCharacters.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const productOptions = savedProducts.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  // Get selected character/product reference images
  const getSelectedReferenceImages = useCallback((): string[] => {
    const MAX_REFS_PER_TYPE = 7;

    if (model === "characters" && subModel) {
      const char = savedCharacters.find((c) => c.id === subModel);
      return char?.referenceImages || [];
    }
    if (model === "products" && subModel) {
      const prod = savedProducts.find((p) => p.id === subModel);
      return prod?.referenceImages || [];
    }
    if (model === "ugc") {
      const charImages: string[] = [];
      const prodImages: string[] = [];

      if (ugcCharacter) {
        const char = savedCharacters.find((c) => c.id === ugcCharacter);
        if (char?.referenceImages) {
          charImages.push(...char.referenceImages.slice(0, MAX_REFS_PER_TYPE));
        }
      }
      if (ugcProduct) {
        const prod = savedProducts.find((p) => p.id === ugcProduct);
        if (prod?.referenceImages) {
          prodImages.push(...prod.referenceImages.slice(0, MAX_REFS_PER_TYPE));
        }
      }

      return [...charImages, ...prodImages];
    }
    return [];
  }, [
    model,
    subModel,
    ugcCharacter,
    ugcProduct,
    savedCharacters,
    savedProducts,
  ]);

  // Handle initial model/subModel from URL params
  useEffect(() => {
    if (initialModel) {
      setModel(initialModel);
    }
    if (initialSubModel) {
      setSubModel(initialSubModel);
    }
  }, [initialModel, initialSubModel]);

  // Handle recreate data
  useEffect(() => {
    if (recreateData) {
      setPrompt(recreateData.prompt);
      // Clear any existing reference images for a fresh start
      setReferenceImages([]);
    }
  }, [recreateData]);

  // Handle edit data - load image from URL and clear prompt
  useEffect(() => {
    if (!editData?.imageUrl) return;

    const loadImageFromUrl = async () => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      // Add placeholder with loading state
      setReferenceImages([
        {
          id,
          preview: editData.imageUrl,
          isLoading: true,
        },
      ]);

      // Clear the prompt for editing
      setPrompt("");

      try {
        // Fetch the image and convert to blob
        const response = await fetch(editData.imageUrl);
        if (!response.ok) throw new Error("Failed to fetch image");

        const blob = await response.blob();
        const file = new File([blob], "reference.jpg", {
          type: blob.type || "image/jpeg",
        });

        // Compress the image
        const base64 = await compressImage(file);

        setReferenceImages([
          {
            id,
            preview: editData.imageUrl,
            base64,
            isLoading: false,
          },
        ]);
      } catch (error) {
        console.error("Failed to load image for editing:", error);
        // Remove the failed image
        setReferenceImages([]);
      }
    };

    loadImageFromUrl();
  }, [editData]);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const validFiles: File[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.match(/^image\/(jpeg|png|webp)$/)) continue;
        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) continue;
        if (referenceImages.length + validFiles.length >= MAX_REFERENCE_IMAGES)
          break;
        validFiles.push(file);
      }

      // First, add images with loading state
      const pendingImages: ReferenceImage[] = validFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        isLoading: true,
      }));

      setReferenceImages((prev) =>
        [...prev, ...pendingImages].slice(0, MAX_REFERENCE_IMAGES)
      );
      e.target.value = "";

      // Then compress and convert to base64, update each image
      for (const img of pendingImages) {
        try {
          if (!img.file) continue;
          // Compress image to stay under API size limits while maintaining quality
          const base64 = await compressImage(img.file);
          setReferenceImages((prev) =>
            prev.map((i) =>
              i.id === img.id ? { ...i, base64, isLoading: false } : i
            )
          );
        } catch {
          // Remove failed image
          setReferenceImages((prev) => prev.filter((i) => i.id !== img.id));
        }
      }
    },
    [referenceImages.length]
  );

  const removeReferenceImage = useCallback((id: string) => {
    setReferenceImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const isImagesLoading = referenceImages.some((img) => img.isLoading);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isImagesLoading) return;

    // Validate prompt is required
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    // Validate mode-specific requirements
    if (model === "characters") {
      if (!subModel) {
        toast.error("Please select a character");
        return;
      }
    }
    if (model === "products") {
      if (!subModel) {
        toast.error("Please select a product");
        return;
      }
    }
    if (model === "ugc") {
      if (!ugcCharacter && !ugcProduct) {
        toast.error("Please select a character and product");
        return;
      }
      if (!ugcCharacter) {
        toast.error("Please select a character");
        return;
      }
      if (!ugcProduct) {
        toast.error("Please select a product");
        return;
      }
    }

    // Get manually uploaded reference images (base64)
    const uploadedImageData = referenceImages
      .filter((img) => img.base64)
      .map((img) => img.base64 as string);

    // Get character/product reference images (URLs)
    const savedReferenceImages = getSelectedReferenceImages();

    // Combine both - saved images first, then uploaded
    const allReferenceImages = [...savedReferenceImages, ...uploadedImageData];

    onSubmit?.({
      prompt,
      model,
      count: imageCount,
      aspectRatio,
      resolution,
      outputFormat,
      referenceImages: allReferenceImages,
    });
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
        <div className="min-h-0 min-w-0 flex-1 space-y-3">
          {/* Reference images preview */}
          {referenceImages.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {referenceImages.map((img) => (
                <div key={img.id} className="group relative shrink-0">
                  <div className="relative size-14 rounded-xl bg-zinc-800">
                    {img.isLoading ? (
                      <div className="size-full animate-[shimmer_1.5s_infinite] animate-pulse rounded-xl bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%]" />
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.preview}
                          alt="Reference"
                          className="size-full rounded-xl object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeReferenceImage(img.id)}
                          className="absolute -top-3 -right-3 z-10 grid h-6 w-6 items-center justify-center rounded-lg border border-zinc-600 bg-zinc-800 text-white transition hover:bg-zinc-700 xl:opacity-0 xl:group-hover:opacity-100"
                        >
                          <CloseIcon />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {referenceImages.length < MAX_REFERENCE_IMAGES && (
                <div className="relative size-14 shrink-0 rounded-xl bg-zinc-800">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="grid size-full cursor-pointer items-center justify-center text-white transition active:opacity-60"
                  >
                    <ImageAddIcon />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Prompt row */}
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={handleFileSelect}
            />
            {referenceImages.length === 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative -top-[5.5px] grid h-8 w-8 shrink-0 items-center justify-center rounded-[0.625rem] border border-zinc-700/50 bg-zinc-800/50 text-white transition hover:bg-cyan-400/10 hover:text-cyan-400"
                title="Add reference images (max 8)"
              >
                <PlusIcon />
              </button>
            )}
            <textarea
              ref={textareaRef}
              name="prompt"
              placeholder="Describe the scene you imagine"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                autoResizeTextarea();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!isImagesLoading && prompt.trim()) {
                    handleSubmit(e as unknown as React.FormEvent);
                  }
                }
              }}
              className="hide-scrollbar max-h-[120px] min-h-[40px] w-full resize-none rounded-none border-none bg-transparent p-0 text-[15px] text-white placeholder:text-gray-500 focus:outline-none"
            />
          </div>

          {/* Controls row */}
          <div className="flex h-9 items-center gap-2">
            {/* Model selector */}
            <SelectDropdown
              options={modelOptions}
              value={model}
              onChange={(value) => {
                setModel(value);
                setSubModel("");
                setUgcCharacter("");
                setUgcProduct("");
              }}
            />

            {/* Secondary selector for Characters/Products */}
            {model === "characters" && characterOptions.length > 0 && (
              <SelectDropdown
                options={characterOptions}
                value={subModel}
                onChange={setSubModel}
              />
            )}
            {model === "characters" && characterOptions.length === 0 && (
              <a
                href="/create-character"
                className="flex h-10 items-center gap-2 rounded-xl border border-dashed border-zinc-600 bg-zinc-800/30 px-3 text-sm text-gray-400 transition hover:border-cyan-400/50 hover:text-cyan-400"
              >
                + Create a character
              </a>
            )}
            {model === "products" && productOptions.length > 0 && (
              <SelectDropdown
                options={productOptions}
                value={subModel}
                onChange={setSubModel}
              />
            )}
            {model === "products" && productOptions.length === 0 && (
              <a
                href="/products"
                className="flex h-10 items-center gap-2 rounded-xl border border-dashed border-zinc-600 bg-zinc-800/30 px-3 text-sm text-gray-400 transition hover:border-cyan-400/50 hover:text-cyan-400"
              >
                + Create a product
              </a>
            )}

            {/* UGC mode - both Character and Product selectors */}
            {model === "ugc" && (
              <>
                {characterOptions.length > 0 ? (
                  <SelectDropdown
                    options={[
                      { value: "", label: "Character" },
                      ...characterOptions,
                    ]}
                    value={ugcCharacter}
                    onChange={setUgcCharacter}
                  />
                ) : (
                  <a
                    href="/create-character"
                    className="flex h-10 items-center gap-2 rounded-xl border border-dashed border-zinc-600 bg-zinc-800/30 px-3 text-sm text-gray-400 transition hover:border-cyan-400/50 hover:text-cyan-400"
                  >
                    + Character
                  </a>
                )}
                {productOptions.length > 0 ? (
                  <SelectDropdown
                    options={[
                      { value: "", label: "Product" },
                      ...productOptions,
                    ]}
                    value={ugcProduct}
                    onChange={setUgcProduct}
                  />
                ) : (
                  <a
                    href="/products"
                    className="flex h-10 items-center gap-2 rounded-xl border border-dashed border-zinc-600 bg-zinc-800/30 px-3 text-sm text-gray-400 transition hover:border-cyan-400/50 hover:text-cyan-400"
                  >
                    + Product
                  </a>
                )}
              </>
            )}

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
              icon={aspectRatioIcons[aspectRatio] || <AutoIcon />}
              showIcons
            />

            {/* Resolution selector */}
            <SelectDropdown
              options={resolutionOptions}
              value={resolution}
              onChange={setResolution}
              icon={<ResolutionIcon />}
            />

            {/* Output format selector */}
            <SelectDropdown
              options={outputFormatOptions}
              value={outputFormat}
              onChange={setOutputFormat}
              icon={<FormatIcon />}
            />
          </div>
        </div>

        {/* Right section - Generate button */}
        <aside className="flex h-[84px] items-end justify-end gap-3 self-end">
          <button
            type="submit"
            disabled={isImagesLoading}
            tabIndex={-1}
            className="inline-grid h-full w-36 grid-flow-col items-center justify-center gap-2 rounded-xl bg-cyan-400 px-2.5 text-sm font-semibold text-black transition hover:bg-cyan-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {isImagesLoading ? "Uploading..." : "Generate"}
              </span>
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
