"use client";

import { PhotoResult } from "@/features/camera/types";

export interface PhotoPreviewProps {
  result: PhotoResult;
  onRetake: () => void;
  onUsePhoto: (result: PhotoResult) => void;
}

export function PhotoPreview({ result, onRetake, onUsePhoto }: PhotoPreviewProps) {
  return (
    <div className="flex flex-col h-full w-full max-w-[500px] mx-auto">
      {/* Photo result */}
      <div className="flex-1 relative camera-viewport">
        <img
          src={result.dataUrl}
          alt="Hasil foto dengan frame"
          className="canvas-result"
        />
        <canvas ref={(el) => {}} className="hidden" />
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-6 pt-4 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onRetake}
          className="flex-1 sj-btn-outline"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2L15 10l3 2.222M6 6h.01M13 20h6V4h-6z" />
          </svg>
          Ulangi
        </button>
        <button
          onClick={() => onUsePhoto(result)}
          className="flex-1 sj-btn-primary"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Gunakan Foto
        </button>
      </div>

      {/* Info */}
      <div className="px-4 pb-4 text-xs text-sj-muted text-center">
        Filter: <span className="font-medium capitalize">{result.filterKey}</span>
        {result.frameId && (
          <span className="ml-2">· Frame: <span className="font-medium">{result.frameId}</span></span>
        )}
        <br />
        {result.width} × {result.height} px
      </div>
    </div>
  );
}
