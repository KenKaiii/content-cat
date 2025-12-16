"use client";

import { useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import UploadModal from "@/components/UploadModal";
import UploadReviewModal from "@/components/UploadReviewModal";

const previewImages = [
  {
    id: 1,
    image: "/images/character-1.jpg",
    rotation: "-rotate-12",
    size: "h-40 w-32",
    z: "z-10",
    offset: "-mr-4",
  },
  {
    id: 2,
    image: "/images/character-2.jpg",
    rotation: "rotate-3",
    size: "h-52 w-40",
    z: "z-20",
    offset: "-mr-6",
  },
  {
    id: 3,
    image: "/images/character-3.jpg",
    rotation: "-rotate-6",
    size: "h-44 w-34",
    z: "z-30",
    offset: "-mr-3",
  },
  {
    id: 4,
    image: "/images/character-4.jpg",
    rotation: "rotate-10",
    size: "h-48 w-36",
    z: "z-20",
    offset: "",
  },
];

const galleryImages = [
  { id: 1, image: "/images/gallery-1.jpg" },
  { id: 2, image: "/images/gallery-2.jpg" },
  { id: 3, image: "/images/gallery-3.jpg" },
  { id: 4, image: "/images/gallery-4.jpg" },
  { id: 5, image: "/images/gallery-5.jpg" },
];

export default function CreateCharacter() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
    setIsUploadModalOpen(false);
    setIsReviewModalOpen(true);
  };

  const handleGenerate = (name: string) => {
    console.log(
      "Generating character:",
      name,
      "with",
      uploadedFiles.length,
      "images"
    );
    // TODO: Handle character generation
    setIsReviewModalOpen(false);
    setUploadedFiles([]);
  };

  const handleReviewModalClose = () => {
    setIsReviewModalOpen(false);
    setUploadedFiles([]);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0a0a]">
      <Header />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFilesSelected={handleFilesSelected}
      />
      <UploadReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleReviewModalClose}
        initialFiles={uploadedFiles}
        onGenerate={handleGenerate}
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
                alt={`Character preview ${item.id}`}
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
          <h1 className="font-heading text-4xl text-white">
            MAKE YOUR OWN CHARACTER
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            Generate infinite selfies in different styles using your own photos.
          </p>
          <p className="text-sm text-gray-400">
            We analyze your images to learn your unique look in minutes
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="mb-4 flex cursor-pointer items-center gap-2 rounded-lg bg-cyan-400 px-6 py-3 font-semibold text-black shadow-lg shadow-cyan-400/25 transition-all duration-300 hover:bg-cyan-500 hover:shadow-cyan-500/30"
        >
          <span>✦</span>
          Create Character
        </button>

        {/* Gallery Section */}
        <div className="flex gap-4 overflow-x-auto pb-2">
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
      </main>
    </div>
  );
}
