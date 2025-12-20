"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { toast } from "sonner";
import JSZip from "jszip";
import { apiFetch } from "@/lib/csrf";
import type { AssetTab } from "./AssetsSidebar";

interface UploadedAsset {
  id: string;
  url: string;
  filename: string;
  category: string;
  type: "image" | "video" | "other";
  sizeBytes: number;
  createdAt: string;
}

interface GeneratedAsset {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  prompt: string;
  type: "image" | "video";
  aspectRatio?: string;
  createdAt: string;
}

type Asset = UploadedAsset | GeneratedAsset;

interface DateGroup<T extends Asset> {
  date: string;
  dateLabel: string;
  assets: T[];
}

const CheckIcon = ({ dark = false }: { dark?: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke={dark ? "#000" : "currentColor"}
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function formatDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function groupAssetsByDate<T extends Asset>(assets: T[]): DateGroup<T>[] {
  const groups: Record<string, T[]> = {};

  assets.forEach((asset) => {
    const date = new Date(asset.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(asset);
  });

  return Object.entries(groups)
    .map(([date, assets]) => ({
      date,
      dateLabel: formatDateLabel(date),
      assets,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

interface AssetsGridProps {
  activeTab: AssetTab;
  searchQuery: string;
  onCountChange?: (tab: AssetTab, count: number) => void;
}

export default function AssetsGrid({
  activeTab,
  searchQuery,
  onCountChange,
}: AssetsGridProps) {
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setSelectedIds(new Set()); // Clear selection on tab change
    try {
      const response = await apiFetch(`/api/assets?tab=${activeTab}`);
      if (response.ok) {
        const result = await response.json();
        if (activeTab === "uploaded") {
          setUploadedAssets(result.data);
          onCountChange?.("uploaded", result.count);
        } else {
          setGeneratedAssets(result.data);
          onCountChange?.("generated", result.count);
        }
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, onCountChange]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    const assets = activeTab === "uploaded" ? uploadedAssets : generatedAssets;
    const selectedAssets = assets.filter((a) => selectedIds.has(a.id));

    let successCount = 0;
    for (const asset of selectedAssets) {
      const assetType =
        activeTab === "uploaded"
          ? "uploaded"
          : (asset as GeneratedAsset).type;
      const isUploaded = assetType === "uploaded";
      const url = isUploaded
        ? `/api/assets?type=uploaded&url=${encodeURIComponent((asset as UploadedAsset).url)}`
        : `/api/assets?type=${assetType}&id=${asset.id}`;

      try {
        const response = await apiFetch(url, { method: "DELETE" });
        if (response.ok) {
          successCount++;
        }
      } catch {
        // Continue with other deletions
      }
    }

    if (successCount > 0) {
      toast.success(`Deleted ${successCount} asset${successCount > 1 ? "s" : ""}`);
      if (activeTab === "uploaded") {
        setUploadedAssets((prev) => prev.filter((a) => !selectedIds.has(a.id)));
        onCountChange?.("uploaded", uploadedAssets.length - successCount);
      } else {
        setGeneratedAssets((prev) => prev.filter((a) => !selectedIds.has(a.id)));
        onCountChange?.("generated", generatedAssets.length - successCount);
      }
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectGroup = useCallback((assetIds: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = assetIds.every((id) => next.has(id));
      if (allSelected) {
        assetIds.forEach((id) => next.delete(id));
      } else {
        assetIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, []);

  const handleDownloadSelected = useCallback(async () => {
    if (selectedIds.size === 0 || isDownloading) return;

    setIsDownloading(true);
    const loadingToast = toast.loading(
      selectedIds.size === 1 ? "Preparing download..." : "Creating zip file..."
    );

    try {
      const assets = activeTab === "uploaded" ? uploadedAssets : generatedAssets;
      const selectedAssetsList = assets.filter((a) => selectedIds.has(a.id));

      if (selectedAssetsList.length === 1) {
        // Single file download
        const asset = selectedAssetsList[0];
        const url = asset.url;
        const response = await fetch(url);
        const blob = await response.blob();

        // Get filename from URL or generate one
        const ext = asset.type === "video" ? ".mp4" : ".jpg";
        const filename =
          "filename" in asset
            ? (asset as UploadedAsset).filename
            : `asset-${asset.id}${ext}`;

        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        toast.success("Download started", { id: loadingToast });
      } else {
        // Multiple files - create zip
        const zip = new JSZip();

        for (let i = 0; i < selectedAssetsList.length; i++) {
          const asset = selectedAssetsList[i];
          try {
            const response = await fetch(asset.url);
            const blob = await response.blob();

            const ext = asset.type === "video" ? ".mp4" : ".jpg";
            const filename =
              "filename" in asset
                ? (asset as UploadedAsset).filename
                : `asset-${i + 1}${ext}`;

            zip.file(filename, blob);
          } catch (error) {
            console.error(`Failed to fetch ${asset.url}:`, error);
          }
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const downloadUrl = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `assets-${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        toast.success(`Downloaded ${selectedAssetsList.length} files`, {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed", { id: loadingToast });
    } finally {
      setIsDownloading(false);
    }
  }, [selectedIds, isDownloading, activeTab, uploadedAssets, generatedAssets]);

  // Filter assets by search query
  const filteredUploaded = useMemo(
    () =>
      uploadedAssets.filter(
        (asset) =>
          asset.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.category.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [uploadedAssets, searchQuery]
  );

  const filteredGenerated = useMemo(
    () =>
      generatedAssets.filter((asset) =>
        asset.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [generatedAssets, searchQuery]
  );

  const uploadedGroups = useMemo(
    () => groupAssetsByDate(filteredUploaded),
    [filteredUploaded]
  );
  const generatedGroups = useMemo(
    () => groupAssetsByDate(filteredGenerated),
    [filteredGenerated]
  );

  const groups = activeTab === "uploaded" ? uploadedGroups : generatedGroups;
  const title =
    activeTab === "generated" ? "Generated Assets" : "Uploaded Assets";
  const isEmpty = groups.length === 0;

  // Get selected assets for thumbnail preview
  const selectedAssets = useMemo(() => {
    const assets = activeTab === "uploaded" ? uploadedAssets : generatedAssets;
    return assets.filter((a) => selectedIds.has(a.id)).slice(0, 2);
  }, [activeTab, uploadedAssets, generatedAssets, selectedIds]);

  return (
    <section className="relative grid grid-rows-[auto_1fr] gap-4 min-h-0 flex-1">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="font-heading text-lg text-white uppercase">
          {title}
        </h1>
      </header>

      {/* Grid Container */}
      <div className="relative w-full h-full border border-zinc-800 border-b-0 bg-zinc-900 min-h-0 p-4 pb-20 overflow-y-auto rounded-t-[1.25rem] select-none">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="size-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
              <span className="text-sm text-zinc-400">Loading assets...</span>
            </div>
          </div>
        ) : isEmpty ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <h2 className="font-heading text-center text-2xl font-bold text-white uppercase">
                Nothing Here Yet
              </h2>
              <p className="text-center text-sm text-gray-400">
                {activeTab === "generated"
                  ? "Generate images or videos to see them here"
                  : "Upload files to see them here"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => {
              const groupIds = group.assets.map((a) => a.id);
              const allSelected = groupIds.every((id) => selectedIds.has(id));
              const someSelected =
                !allSelected && groupIds.some((id) => selectedIds.has(id));

              return (
                <div key={group.date}>
                  {/* Date Header with Select All */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => toggleSelectGroup(groupIds)}
                      className="inline-grid grid-flow-col-dense auto-cols-min gap-2 items-center cursor-pointer group"
                    >
                      <span
                        role="checkbox"
                        aria-checked={allSelected}
                        className={`size-5 rounded border-2 flex items-center justify-center transition-all ${
                          allSelected
                            ? "bg-white border-white"
                            : someSelected
                              ? "bg-white/50 border-white"
                              : "border-zinc-600 group-hover:border-zinc-500"
                        }`}
                      >
                        <span className={allSelected || someSelected ? "opacity-100" : "opacity-0"}>
                          <CheckIcon dark />
                        </span>
                      </span>
                      <h2 className="text-sm font-bold text-white truncate">
                        {group.dateLabel}
                      </h2>
                    </button>
                  </div>

                  {/* Assets Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {activeTab === "uploaded"
                      ? (group.assets as UploadedAsset[]).map((asset) => (
                          <UploadedAssetCard
                            key={asset.id}
                            asset={asset}
                            isSelected={selectedIds.has(asset.id)}
                            onToggleSelect={() => toggleSelect(asset.id)}
                          />
                        ))
                      : (group.assets as GeneratedAsset[]).map((asset) => (
                          <GeneratedAssetCard
                            key={asset.id}
                            asset={asset}
                            isSelected={selectedIds.has(asset.id)}
                            onToggleSelect={() => toggleSelect(asset.id)}
                          />
                        ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center h-12 px-1 gap-1 rounded-full backdrop-blur-[2rem] z-50"
          style={{
            boxShadow:
              "rgba(255, 255, 255, 0.3) -0.5px -0.5px 1px 0px inset, rgba(255, 255, 255, 0.6) 0.8px 0.5px 0.5px 0px inset",
            background:
              "linear-gradient(0deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.06) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.8) 100%), rgba(204, 204, 204, 0.2)",
            backgroundBlendMode: "normal, normal, color-burn",
          }}
        >
          {/* Selected count with image stack */}
          <div className="grid grid-cols-[auto_1fr] items-center h-full gap-2 px-3">
            <div className="relative size-4">
              {selectedAssets.map((asset, index) => {
                const isVideo = asset.type === "video";
                const thumbnailUrl =
                  "thumbnailUrl" in asset ? asset.thumbnailUrl : null;
                return (
                  <figure
                    key={asset.id}
                    className="absolute top-0 left-0 size-full overflow-hidden rounded-xs ring-1 ring-white shadow-md"
                    style={{
                      zIndex: index + 1,
                      transform: index === 0 ? "rotate(-2deg)" : "rotate(12deg)",
                    }}
                  >
                    {isVideo ? (
                      thumbnailUrl ? (
                        <Image
                          src={thumbnailUrl}
                          alt="selected asset"
                          fill
                          className="object-cover"
                          sizes="16px"
                        />
                      ) : (
                        <video
                          src={asset.url}
                          className="absolute inset-0 size-full object-cover"
                          muted
                          playsInline
                        />
                      )
                    ) : (
                      <Image
                        src={asset.url}
                        alt="selected asset"
                        fill
                        className="object-cover"
                        sizes="16px"
                      />
                    )}
                  </figure>
                );
              })}
            </div>
            <p className="text-sm font-semibold flex whitespace-nowrap">
              <span className="min-w-3 pr-1 text-left">{selectedIds.size}</span>
              selected
            </p>
          </div>

          {/* Download button */}
          <button
            type="button"
            onClick={handleDownloadSelected}
            disabled={isDownloading}
            className="flex items-center gap-1.5 h-10 px-4 rounded-full text-sm font-bold transition-colors disabled:opacity-50"
            style={{
              color: "#22d3ee",
              backgroundColor: "rgba(34, 211, 238, 0.15)",
              boxShadow:
                "rgba(34, 211, 238, 0.3) -0.5px -0.5px 1px 0px inset, rgba(34, 211, 238, 0.4) 0.8px 0.5px 0.5px 0px inset",
            }}
            onMouseEnter={(e) => {
              if (!isDownloading) {
                e.currentTarget.style.backgroundColor = "rgba(34, 211, 238, 0.25)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(34, 211, 238, 0.15)";
            }}
          >
            {isDownloading ? (
              <div className="size-5 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.25 14.75V19.25C20.25 19.8023 19.8023 20.25 19.25 20.25H4.75C4.19772 20.25 3.75 19.8023 3.75 19.25V14.75M12 15V3.75M12 15L8.5 11.5M12 15L15.5 11.5" />
              </svg>
            )}
            {isDownloading ? "Downloading..." : "Download"}
          </button>

          {/* Delete button */}
          <button
            type="button"
            onClick={handleDeleteSelected}
            className="flex items-center justify-center size-10 rounded-full transition hover:bg-white/10"
            style={{
              backdropFilter: "blur(2rem)",
              boxShadow:
                "rgba(255, 255, 255, 0.3) -0.5px -0.5px 1px 0px inset, rgba(255, 255, 255, 0.6) 0.8px 0.5px 0.5px 0px inset",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.75 6.5L5.72041 20.32C5.7572 20.8439 6.19286 21.25 6.71796 21.25H17.282C17.8071 21.25 18.2428 20.8439 18.2796 20.32L19.25 6.5" />
              <path d="M3.25 5.75H20.75" />
              <path d="M8.5246 5.58289C8.73079 3.84652 10.2081 2.5 12 2.5C13.7919 2.5 15.2692 3.84652 15.4754 5.58289" />
              <path d="M10 10.5V16.25" />
              <path d="M14 10.5V16.25" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}

function UploadedAssetCard({
  asset,
  isSelected,
  onToggleSelect,
}: {
  asset: UploadedAsset;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  const isVideo = asset.type === "video";
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <figure
      aria-selected={isSelected}
      className="group relative aspect-square overflow-hidden rounded-2xl bg-zinc-800 cursor-pointer z-0 ring-3 ring-transparent aria-selected:ring-white hover:ring-zinc-600 transition"
      onClick={onToggleSelect}
    >
      {/* Skeleton loader */}
      {!isLoaded && (
        <div className="skeleton-loader absolute inset-0 -z-10" />
      )}

      {isVideo ? (
        <video
          src={asset.url}
          className={`absolute inset-0 size-full object-cover -z-10 transition group-hover:brightness-75 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          muted
          playsInline
          onLoadedData={() => setIsLoaded(true)}
          onMouseEnter={(e) => {
            e.currentTarget.play().catch(() => {});
          }}
          onMouseLeave={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
        />
      ) : (
        <Image
          src={asset.url}
          alt={asset.filename}
          fill
          loading="lazy"
          className={`object-cover -z-10 transition group-hover:brightness-75 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          sizes="150px"
          onLoad={() => setIsLoaded(true)}
        />
      )}

      {/* Selection checkbox */}
      <label
        className={`absolute top-0 left-0 z-10 p-2 transition-opacity ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={isSelected}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className={`size-5 rounded border-2 flex items-center justify-center transition-all ${
            isSelected
              ? "bg-white border-white"
              : "border-white/70 bg-black/30"
          }`}
        >
          <span className={isSelected ? "opacity-100" : "opacity-0"}>
            <CheckIcon dark />
          </span>
        </button>
      </label>

      {/* Category badge */}
      <div className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white capitalize">
        {asset.category}
      </div>
    </figure>
  );
}

function GeneratedAssetCard({
  asset,
  isSelected,
  onToggleSelect,
}: {
  asset: GeneratedAsset;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  const isVideo = asset.type === "video";
  const thumbnailUrl = asset.thumbnailUrl || asset.url;
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <figure
      aria-selected={isSelected}
      className="group relative aspect-square overflow-hidden rounded-2xl bg-zinc-800 cursor-pointer z-0 ring-3 ring-transparent aria-selected:ring-white hover:ring-zinc-600 transition"
      onClick={onToggleSelect}
    >
      {/* Skeleton loader */}
      {!isLoaded && (
        <div className="skeleton-loader absolute inset-0 -z-10" />
      )}

      {isVideo ? (
        <video
          src={asset.url}
          poster={asset.thumbnailUrl || undefined}
          className={`absolute inset-0 size-full object-cover -z-10 transition group-hover:brightness-75 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          muted
          playsInline
          onLoadedData={() => setIsLoaded(true)}
          onMouseEnter={(e) => {
            e.currentTarget.play().catch(() => {});
          }}
          onMouseLeave={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
        />
      ) : (
        <Image
          src={thumbnailUrl}
          alt={asset.prompt}
          fill
          loading="lazy"
          className={`object-cover -z-10 transition group-hover:brightness-75 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          sizes="150px"
          onLoad={() => setIsLoaded(true)}
        />
      )}

      {/* Selection checkbox */}
      <label
        className={`absolute top-0 left-0 z-10 p-2 transition-opacity ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={isSelected}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className={`size-5 rounded border-2 flex items-center justify-center transition-all ${
            isSelected
              ? "bg-white border-white"
              : "border-white/70 bg-black/30"
          }`}
        >
          <span className={isSelected ? "opacity-100" : "opacity-0"}>
            <CheckIcon dark />
          </span>
        </button>
      </label>

      {/* Type badge */}
      <div className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white capitalize">
        {asset.type}
      </div>
    </figure>
  );
}
