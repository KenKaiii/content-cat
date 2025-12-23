"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import UploadModal from "@/components/UploadModal";
import UploadReviewModal, {
  type UploadedImage,
} from "@/components/UploadReviewModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import EntityCard from "@/components/EntityCard";
import { useEntityManagement } from "@/hooks/useEntityManagement";
import type { Entity } from "@/types/entities";

interface PreviewImage {
  id: number;
  image: string;
  rotation: string;
  size: string;
  z: string;
  offset: string;
}

interface GalleryImage {
  id: number;
  image: string;
}

interface EntityManagementPageProps {
  entityType: "character" | "product";
  title: string;
  subtitle: string;
  subtitle2: string;
  buttonText: string;
  buttonLoadingText: string;
  deleteTitle: string;
  deleteMessage: string;
  generateUrlParam: string;
  previewImages: PreviewImage[];
  galleryImages: GalleryImage[];
}

export default function EntityManagementPage({
  entityType,
  title,
  subtitle,
  subtitle2,
  buttonText,
  buttonLoadingText,
  deleteTitle,
  deleteMessage,
  generateUrlParam,
  previewImages,
  galleryImages,
}: EntityManagementPageProps) {
  const router = useRouter();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const {
    entities,
    isLoading,
    isCreating,
    hasFetched,
    editingEntity,
    deleteEntityId,
    handleCreate,
    handleSaveEdit,
    handleDelete,
    confirmDelete,
    cancelDelete,
    setEditingEntity,
  } = useEntityManagement({ entityType });

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
    setIsUploadModalOpen(false);
    setIsReviewModalOpen(true);
  };

  const handleGenerate = async (name: string, images: UploadedImage[]) => {
    try {
      await handleCreate(name, images);
      setIsReviewModalOpen(false);
      setUploadedFiles([]);
    } catch {
      // Error already handled in hook
    }
  };

  const handleReviewModalClose = () => {
    setIsReviewModalOpen(false);
    setUploadedFiles([]);
    setEditingEntity(null);
  };

  const handleEditEntity = (entity: Entity) => {
    setEditingEntity(entity);
    setIsReviewModalOpen(true);
  };

  const handleSaveEditWrapper = async (
    id: string,
    name: string,
    images: UploadedImage[]
  ) => {
    try {
      await handleSaveEdit(id, name, images);
      setIsReviewModalOpen(false);
    } catch {
      // Error already handled in hook
    }
  };

  const handleGenerateWithEntity = (entityId: string) => {
    router.push(`/image?model=${generateUrlParam}&${entityType}Id=${entityId}`);
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      <Header />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFilesSelected={handleFilesSelected}
        entityType={entityType}
      />
      <UploadReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleReviewModalClose}
        initialFiles={uploadedFiles}
        onGenerate={handleGenerate}
        editCharacter={editingEntity}
        onSaveEdit={handleSaveEditWrapper}
        isLoading={isCreating}
      />
      <DeleteConfirmationModal
        isOpen={!!deleteEntityId}
        title={deleteTitle}
        message={deleteMessage}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        {/* Preview Cards */}
        <div className="flex items-end justify-center">
          {previewImages.map((item) => (
            <div
              key={item.id}
              className={`relative overflow-hidden rounded-2xl border-2 border-white bg-zinc-800 ${item.size} ${item.rotation} ${item.z} ${item.offset}`}
            >
              <Image
                src={item.image}
                alt={`${entityType} preview ${item.id}`}
                fill
                sizes="200px"
                priority
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Title Section */}
        <div className="text-center">
          <h1 className="font-heading text-4xl text-white">{title}</h1>
          <p className="mt-3 text-sm text-zinc-300">{subtitle}</p>
          <p className="text-sm text-zinc-300">{subtitle2}</p>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          disabled={isCreating}
          className="btn-primary mb-4"
        >
          <span>✦</span>
          {isCreating ? buttonLoadingText : buttonText}
        </button>

        {/* Content Grid - all sections stacked, toggle visibility with opacity */}
        <div className="relative grid w-full [&>*]:col-start-1 [&>*]:row-start-1">
          {/* Saved Entities Section - show if entities exist */}
          <div
            className={`flex w-full justify-center gap-4 transition-opacity duration-200 ${
              entities.length > 0
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            {entities.map((entity) => (
              <EntityCard
                key={entity.id}
                entity={entity}
                onGenerate={handleGenerateWithEntity}
                onEdit={handleEditEntity}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Empty State / Gallery Section */}
          {/* Only show after fetch confirms no entities exist to prevent flicker */}
          <div
            className={`flex w-full justify-center gap-4 transition-opacity duration-200 ${
              hasFetched && !isLoading && entities.length === 0
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            {galleryImages.map((item) => (
              <div
                key={item.id}
                className="relative h-72 w-48 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-800"
              >
                <Image
                  src={item.image}
                  alt={`Gallery image ${item.id}`}
                  fill
                  sizes="192px"
                  priority
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
