"use client";

import { memo, useCallback, useState } from "react";
import Image from "next/image";
import { SparkleIcon, EditIcon, DeleteIcon } from "@/components/icons";
import type { Entity } from "@/types/entities";

interface EntityCardProps {
  entity: Entity;
  onGenerate: (id: string) => void;
  onEdit: (entity: Entity) => void;
  onDelete: (id: string) => void;
}

export default memo(function EntityCard({
  entity,
  onGenerate,
  onEdit,
  onDelete,
}: EntityCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleGenerate = useCallback(
    () => onGenerate(entity.id),
    [onGenerate, entity.id]
  );

  const handleEdit = useCallback(
    () => onEdit(entity),
    [onEdit, entity]
  );

  const handleDelete = useCallback(
    () => onDelete(entity.id),
    [onDelete, entity.id]
  );

  return (
    <div className="group relative" style={{ contain: "layout style" }}>
      <div className="relative h-72 w-48 overflow-hidden rounded-xl border border-white/10 bg-black/40">
        {entity.thumbnailUrl ? (
          <>
            {/* Skeleton while loading */}
            <div
              className={`absolute inset-0 skeleton-loader transition-opacity duration-200 ${
                isLoaded ? "opacity-0" : "opacity-100"
              }`}
            />
            <Image
              src={entity.thumbnailUrl}
              alt={entity.name}
              fill
              sizes="192px"
              className={`object-cover transition-[filter,opacity] duration-200 ease-out group-hover:brightness-50 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setIsLoaded(true)}
              unoptimized
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            No image
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100" />
        {/* Generate button - appears on hover */}
        <button
          type="button"
          onClick={handleGenerate}
          className="absolute top-1/2 left-1/2 inline-grid h-12 -translate-x-1/2 -translate-y-1/2 grid-flow-col items-center justify-center gap-2 rounded-xl border border-pink-400/20 bg-pink-400/10 px-4 text-sm font-medium text-pink-400 opacity-0 backdrop-blur-sm transition-opacity duration-200 ease-out group-hover:opacity-100 hover:bg-pink-400/20"
        >
          <SparkleIcon className="size-5" />
          Generate
        </button>
        {/* Top-right action buttons - appear on hover */}
        <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
          {/* Edit button */}
          <button
            onClick={handleEdit}
            className="grid h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-white/70 backdrop-blur-sm transition-colors hover:text-white"
            title={`Edit ${entity.name}`}
          >
            <EditIcon />
          </button>
          {/* Delete button */}
          <button
            onClick={handleDelete}
            className="grid h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-white/70 backdrop-blur-sm transition-colors hover:text-red-500"
            title={`Delete ${entity.name}`}
          >
            <DeleteIcon />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="font-heading truncate text-xs text-white uppercase">
            {entity.name}
          </p>
          <p className="text-xs text-zinc-300">
            {entity.referenceImages.length} images
          </p>
        </div>
      </div>
    </div>
  );
});
