"use client";

import { useState, useCallback } from "react";

interface GalleryProps {
  photos: Array<{
    id: string;
    storage_path: string;
    eventId: string;
  }>;
  eventId: string;
}

export function Gallery({ photos, eventId }: GalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const downloadPhoto = useCallback((url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const photoUrl = (storagePath: string) =>
    `/api/uploads/${eventId}/${storagePath.split("/").pop()}`;

  return (
    <>
      {/* Gallery grid */}
      <div className="grid grid-cols-2 gap-3">
        {photos.map((photo: any) => {
          const url = photoUrl(photo.storage_path);
          return (
            <div
              key={photo.id}
              className="relative group overflow-hidden rounded-xl bg-zinc-200 cursor-pointer"
              onClick={() => setSelectedPhoto(url)}
            >
              <img
                src={url}
                alt={`Foto ${photo.id}`}
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium">Lihat</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox / Popup untuk memperbesar foto */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)}>
          <div className="relative flex flex-col items-center justify-center max-w-full max-h-full w-full h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto}
              alt="Foto diperbesar"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/10"
            />
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => downloadPhoto(selectedPhoto, `snapjoy-${Date.now()}.webp`)}
                className="bg-white text-sj-brand px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-sj-bg-soft transition-colors"
              >
                ⬇️ Unduh
              </button>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="bg-white text-sj-brand px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-red-50 transition-colors"
              >
                ✕ Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
