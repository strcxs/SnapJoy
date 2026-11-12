"use client";

import { useEffect, useState } from "react";
import React from "react";
import { CameraView } from "@/components/camera/CameraView";
import { PhotoPreview } from "@/components/camera/PhotoPreview";
import type { PhotoResult } from "@/features/camera/types";

export default function CameraPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = React.use(params);
  const [hasCaptured, setHasCaptured] = useState(false);
  const [photoResult, setPhotoResult] = useState<PhotoResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Kamera - ${eventSlug} | Snapjoy`;
  }, [eventSlug]);

  // Ambil event ID dari slug (untuk demo, mapping slug -> event ID sederhana)
  // Di production sebenarnya ini akan diambil dari database via API
  useEffect(() => {
    const slugToEventId: Record<string, string> = {
      "wedding-2025": "11111111-1111-1111-1111-111111111111",
      "acara-contoh": "22222222-2222-2222-2222-222222222222",
    };
    setEventId(slugToEventId[eventSlug] || null);
  }, [eventSlug]);

  const handlePhotoCaptured = (result: PhotoResult) => {
    setPhotoResult(result);
    setHasCaptured(true);
    setUploadError(null);
  };

  const handleRetake = () => {
    setPhotoResult(null);
    setHasCaptured(false);
    setUploadError(null);
  };

  const handleUsePhoto = async (result: PhotoResult) => {
    if (!eventId) {
      setUploadError("ID acara tidak tersedia.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("eventId", eventId);
      formData.append("file", new File([result.blob], "photo.webp", { type: "image/webp" }));
      formData.append(
        "guestSessionId",
        typeof window !== "undefined" && window.crypto?.randomUUID
          ? window.crypto.randomUUID()
          : "guest-" + Date.now()
      );
      formData.append("filterKey", result.filterKey);
      formData.append("frameId", result.frameId ?? "");
      formData.append("capturedAt", new Date().toISOString());

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const resultUpload = await response.json();

      setIsUploading(false);

      if (!response.ok || !resultUpload.success) {
        setUploadError(resultUpload.error ?? "Upload gagal.");
        return;
      }

      // Sukses: reset state
      setHasCaptured(false);
      setPhotoResult(null);
    } catch (err) {
      setIsUploading(false);
      setUploadError("Terjadi kesalahan saat mengunggah. Silakan coba lagi.");
      console.error("Upload error:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between bg-black/40 backdrop-blur-sm z-10 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sj-accent flex items-center justify-center text-sj-brand font-bold text-xs">
            SQ
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">{decodeURIComponent(
              eventSlug.replace(/-/g, " ")
            )}</h1>
            <p className="text-xs text-white/60">Galeri bersama</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-white/90">Aktif</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {/* Upload error toast */}
        {uploadError && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-100">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">{uploadError}</p>
          </div>
        )}

        {!hasCaptured ? (
          <CameraView onPhotoCaptured={handlePhotoCaptured} />
        ) : (
          <div className="flex flex-col h-full max-w-[500px] mx-auto">
            <PhotoPreview
              result={photoResult!}
              onRetake={handleRetake}
              onUsePhoto={handleUsePhoto}
            />
          </div>
        )}
      </main>

      {/* Uploading toast */}
      {isUploading && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white text-sj-brand shadow-xl border border-sj-brand/20">
            <div className="w-8 h-8 border-4 border-sj-brand border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-sm font-semibold">Mengunggah foto…</p>
              <p className="text-xs text-sj-muted">Mohon tunggu sebentar</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
