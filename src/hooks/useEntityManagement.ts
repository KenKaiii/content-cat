"use client";

import { useState, useEffect, useCallback } from "react";
import type { Entity, UploadedImage } from "@/types/entities";
import { apiFetch } from "@/lib/csrf";

export type EntityType = "character" | "product";

interface UseEntityManagementOptions {
  entityType: EntityType;
}

interface UseEntityManagementReturn {
  entities: Entity[];
  isLoading: boolean;
  isCreating: boolean;
  editingEntity: Entity | null;
  deleteEntityId: string | null;
  fetchEntities: () => Promise<void>;
  handleCreate: (name: string, images: UploadedImage[]) => Promise<void>;
  handleSaveEdit: (
    id: string,
    name: string,
    images: UploadedImage[]
  ) => Promise<void>;
  handleDelete: (id: string) => void;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
  setEditingEntity: (entity: Entity | null) => void;
}

export function useEntityManagement({
  entityType,
}: UseEntityManagementOptions): UseEntityManagementReturn {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [deleteEntityId, setDeleteEntityId] = useState<string | null>(null);

  const apiPath =
    entityType === "character" ? "/api/characters" : "/api/products";
  const entityName = entityType === "character" ? "character" : "product";

  const fetchEntities = useCallback(async () => {
    try {
      const response = await apiFetch(apiPath, { timeout: 15000 });
      if (response.ok) {
        const data = await response.json();
        setEntities(data);
      }
    } catch {
      // Silently fail - entities will show empty state
    } finally {
      setIsLoading(false);
    }
  }, [apiPath]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const handleCreate = useCallback(
    async (name: string, images: UploadedImage[]) => {
      setIsCreating(true);
      try {
        // Upload images to fal.ai storage
        const formData = new FormData();
        images.forEach((img) => {
          if (img.file) formData.append("files", img.file);
        });

        const uploadResponse = await apiFetch("/api/upload", {
          method: "POST",
          body: formData,
          timeout: 60000, // 60s for uploads
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload images");
        }

        const { urls } = await uploadResponse.json();

        // Create entity in database
        const createResponse = await apiFetch(apiPath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            referenceImages: urls,
          }),
          timeout: 15000,
        });

        if (!createResponse.ok) {
          throw new Error(`Failed to create ${entityName}`);
        }

        // Refresh list
        await fetchEntities();
      } catch {
        alert(`Failed to create ${entityName}. Please try again.`);
        throw new Error(`Failed to create ${entityName}`);
      } finally {
        setIsCreating(false);
      }
    },
    [apiPath, entityName, fetchEntities]
  );

  const handleSaveEdit = useCallback(
    async (id: string, name: string, images: UploadedImage[]) => {
      setIsCreating(true);
      try {
        // Separate existing images from new uploads
        const existingUrls = images
          .filter((img) => img.isExisting)
          .map((img) => img.preview);
        const newFiles = images.filter((img) => !img.isExisting && img.file);

        let newUrls: string[] = [];

        // Upload new images if any
        if (newFiles.length > 0) {
          const formData = new FormData();
          newFiles.forEach((img) => {
            if (img.file) formData.append("files", img.file);
          });

          const uploadResponse = await apiFetch("/api/upload", {
            method: "POST",
            body: formData,
            timeout: 60000, // 60s for uploads
          });

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload images");
          }

          const { urls } = await uploadResponse.json();
          newUrls = urls;
        }

        // Combine existing and new URLs
        const allUrls = [...existingUrls, ...newUrls];

        // Update entity in database
        const updateResponse = await apiFetch(`${apiPath}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            referenceImages: allUrls,
          }),
          timeout: 15000,
        });

        if (!updateResponse.ok) {
          throw new Error(`Failed to update ${entityName}`);
        }

        // Refresh list
        await fetchEntities();
        setEditingEntity(null);
      } catch {
        alert(`Failed to update ${entityName}. Please try again.`);
        throw new Error(`Failed to update ${entityName}`);
      } finally {
        setIsCreating(false);
      }
    },
    [apiPath, entityName, fetchEntities]
  );

  const handleDelete = useCallback((id: string) => {
    setDeleteEntityId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteEntityId) return;

    try {
      const response = await apiFetch(`${apiPath}/${deleteEntityId}`, {
        method: "DELETE",
        timeout: 15000,
      });

      if (response.ok) {
        setEntities((prev) => prev.filter((e) => e.id !== deleteEntityId));
      }
    } catch {
      // Silently fail - user can retry
    } finally {
      setDeleteEntityId(null);
    }
  }, [deleteEntityId, apiPath]);

  const cancelDelete = useCallback(() => {
    setDeleteEntityId(null);
  }, []);

  return {
    entities,
    isLoading,
    isCreating,
    editingEntity,
    deleteEntityId,
    fetchEntities,
    handleCreate,
    handleSaveEdit,
    handleDelete,
    confirmDelete,
    cancelDelete,
    setEditingEntity,
  };
}
