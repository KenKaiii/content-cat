"use client";

export default function ImageEmptyState() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-2">
        <h2 className="font-heading text-center text-2xl font-bold text-white uppercase">
          Nothing Here Yet
        </h2>
        <p className="text-center text-sm text-gray-400">
          Type something below and hit generate
        </p>
      </div>
    </div>
  );
}
