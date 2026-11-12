"use client";

import { useCamera } from "@/features/camera/hooks/useCamera";
import type { FilterPreset, PhotoResult, FrameOption } from "@/features/camera/types";

export interface CameraViewProps {
  onPhotoCaptured: (result: PhotoResult) => void;
}

export function CameraView({ onPhotoCaptured }: CameraViewProps) {
  const {
    videoRef,
    canvasRef,
    state,
    currentFilter,
    currentFrame,
    filters,
    frames,
    startCamera,
    switchCamera,
    capture,
    retake,
    setFilter,
    setFrame,
    stopStream,
  } = useCamera();

  // Hitung aspect ratio untuk viewport kamera
  const aspectRatio =
    state.videoWidth && state.videoHeight
      ? state.videoWidth / state.videoHeight
      : 3 / 4;

  const filterButtonClass = (filter: FilterPreset) => {
    const isActive = currentFilter.key === filter.key;
    return `flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${isActive
      ? "bg-sj-brand text-white shadow-sm"
      : "bg-white/20 backdrop-blur-sm text-white/90 hover:bg-white/30"}`;
  };

  const frameButtonClass = (frame: FrameOption) => {
    const isActive = currentFrame?.id === frame.id;
    return `w-12 h-16 rounded-lg border-2 transition-all ${isActive
      ? "border-sj-accent shadow-sm"
      : "border-transparent bg-white/20 hover:border-white/40"}`;
  };

  const shutterButtonClass = () => {
    return `relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 ${
      state.isCapturing ? "border-white/50" : "bg-white"
    }`;
  };

  return (
    <div className="flex flex-col h-full w-full max-w-[500px] mx-auto p-2 sm:p-4">
      {/* Error / Permission state */}
      {state.isError && !state.isInitialized && (
        <div className="flex flex-col items-center justify-center py-6 text-center rounded-2xl bg-red-50 border border-red-100 p-4 sm:p-6">
          <div className="text-4xl mb-3">📷</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Kamera tidak tersedia
          </h3>
          <p className="text-sm text-red-600 mb-3">
            {state.errorMessage}
          </p>
          {state.errorName && (
            <p className="text-[10px] sm:text-xs text-red-500/80 mb-4">
              {state.errorName}
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row justify-center">
            <button
              onClick={() => startCamera()}
              className="sj-btn-primary w-full sm:w-auto"
            >
              Coba Lagi
            </button>
            {state.availableDevices.length > 0 && (
              <button
                onClick={switchCamera}
                className="sj-btn-outline w-full sm:w-auto"
              >
                Ganti Kamera
              </button>
            )}
          </div>
          {state.availableDevices.length === 0 && (
            <p className="text-[10px] sm:text-xs text-red-500/80 mt-2">
              Tidak ada kamera terdeteksi di perangkat ini. Coba tekan "Coba Lagi".
            </p>
          )}
        </div>
      )}

      {/* Camera viewport (live preview) */}
      {!state.hasCaptured && (
        <div className="flex-1 relative camera-viewport w-full">
          {/* Aspect ratio box untuk video - mencegah collapse/layar hitam */}
          <div
            className="relative w-full overflow-hidden bg-black rounded-xl"
            style={{
              aspectRatio: aspectRatio > 0 ? aspectRatio : 3 / 4,
            }}
          >
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el) {
                  el.setAttribute("webkitplaysinline", "true");
                }
              }}
              autoPlay
              playsInline
              muted
              width={state.videoWidth || 640}
              height={state.videoHeight || 480}
              className="camera-video w-full h-full object-cover"
              style={{ filter: currentFilter.cssFilter }}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Loading overlay while starting - render saat belum diinisialisasi */}
            {!state.isInitialized && !state.isError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-20">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-3" />
                <p className="text-white text-sm font-medium">
                  Memulai kamera…
                </p>
              </div>
            )}
          </div>

          {/* Capture overlay controls */}
          <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-4 pointer-events-none">
            <div className="flex items-center justify-between px-2 sm:px-4">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs sm:text-sm font-medium">
                {state.facingMode === "environment"
                  ? "Kamera Belakang"
                  : "Kamera Depan"}
              </div>
              <button
                onClick={switchCamera}
                disabled={state.isCapturing}
                className="p-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full text-white transition-colors active:scale-95 disabled:opacity-50"
                aria-label="Ganti kamera depan/belakang"
                aria-pressed={false}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656-2.12 2.122" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col items-center justify-end flex-1 pr-2 sm:pr-4">
              {/* Filter selector */}
              <div className="flex flex-row gap-2 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide">
                {filters.map((filter: FilterPreset) => (
                  <button
                    key={filter.key}
                    onClick={() => setFilter(filter)}
                    aria-pressed={currentFilter.key === filter.key}
                    className={filterButtonClass(filter)}
                  >
                    <span className="w-3 h-3 rounded-full border border-white/20"></span>
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Frame selector */}
              {frames.length > 1 && (
                <div className="flex flex-row gap-2 overflow-x-auto px-2 sm:px-4 pb-2 sm:pb-4 scrollbar-hide">
                  {frames.map((frame: FrameOption) => (
                    <button
                      key={frame.id}
                      onClick={() => setFrame(frame)}
                      aria-pressed={currentFrame?.id === frame.id}
                      className={frameButtonClass(frame)}
                    >
                      <img
                        src={frame.previewPath || frame.assetPath}
                        alt={frame.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Shutter button - lebih besar untuk mobile (thumb-friendly) */}
              <div className="flex-1 flex items-end justify-center pb-4 sm:pb-6">
                <button
                  onClick={async () => {
                    const result = await capture();
                    if (result) {
                      onPhotoCaptured(result);
                    }
                  }}
                  disabled={state.isCapturing || !state.isInitialized}
                  className={shutterButtonClass()}
                  aria-label="Ambil foto"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20" />
                  {state.isCapturing && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs sm:text-sm font-medium animate-pulse">
                      Memproses…
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white text-xs sm:text-sm font-medium bg-black/60 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
              {state.facingMode === "environment" ? "Kamera Belakang Aktif" : "Kamera Depan Aktif"}
            </div>
          </div>
        </div>
      )}

      {/* Initial state - not started */}
      {!state.isInitialized && !state.isError && !state.hasCaptured && (
        <div className="flex-1 flex flex-col items-center justify-center camera-viewport w-full">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-sj-brand/20 rounded-full flex items-center justify-center mb-3 sm:mb-4 bg-sj-brand/5">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-sj-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-sj-brand mb-2">Mulai Foto</h3>
            <p className="text-sm sm:text-base text-sj-muted mb-6 sm:mb-8 max-w-xs">
              Tekan tombol di bawah untuk memulai kamera dan mengambil foto.
            </p>
            <button
              onClick={() => startCamera()}
              className="sj-btn-primary w-full sm:w-auto"
            >
              Mulai Kamera
            </button>
            {state.availableDevices.length > 0 && (
              <p className="text-[10px] sm:text-xs text-sj-muted mt-2">
                {state.availableDevices.length} kamera terdeteksi
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
