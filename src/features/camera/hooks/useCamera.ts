"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CameraFacingMode,
  DEFAULT_FRAMES,
  FilterPreset,
  FILTER_PRESETS,
  FrameOption,
  PhotoResult,
} from "../types";

interface UseCameraOptions {
  facingMode?: CameraFacingMode;
  videoWidth?: number;
  videoHeight?: number;
  onError?: (message: string) => void;
}

export function useCamera({
  facingMode = "environment",
  videoWidth = 1280,
  videoHeight = 1920,
  onError,
}: UseCameraOptions = {}) {
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [state, setState] = useState<{
    isInitialized: boolean;
    isPermissionDenied: boolean;
    isError: boolean;
    errorMessage: string;
    facingMode: CameraFacingMode;
    isFrontCamera: boolean;
    isCapturing: boolean;
    hasCaptured: boolean;
    isUploading: boolean;
    videoWidth: number;
    videoHeight: number;
  }>({
    isInitialized: false,
    isPermissionDenied: false,
    isError: false,
    errorMessage: "",
    facingMode,
    isFrontCamera: facingMode === "user",
    isCapturing: false,
    hasCaptured: false,
    isUploading: false,
    videoWidth: 0,
    videoHeight: 0,
  });

  const [currentFilter, setCurrentFilter] = useState<FilterPreset>(
    FILTER_PRESETS[0]
  );
  const [currentFrame, setCurrentFrame] = useState<FrameOption | null>(
    DEFAULT_FRAMES[0] ?? null
  );

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      isInitialized: false,
      videoWidth: 0,
      videoHeight: 0,
    }));
  }

  const startCamera = useCallback(async () => {
    stopStream();

    setState((prev) => ({
      ...prev,
      isError: false,
      errorMessage: "",
      isCapturing: false,
      hasCaptured: false,
    }));

    try {
      // 'muted' diperlukan untuk autoplay di beberapa browser
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode,
          width: { ideal: videoWidth },
          height: { ideal: videoHeight },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.srcObject = stream;
        // Tunggu metadata loaded sebelum set isInitialized
        await new Promise<void>((resolve, reject) => {
          const handleLoaded = () => {
            videoElement.removeEventListener(
              "loadedmetadata",
              handleLoaded
            );
            const vw = videoElement.videoWidth || 0;
            const vh = videoElement.videoHeight || 0;
            setState((prev) => ({
              ...prev,
              videoWidth: vw,
              videoHeight: vh,
            }));
            resolve();
          };
          const handleError = (err: any) => {
            videoElement.removeEventListener("error", handleError);
            reject(err);
          };
          videoElement.addEventListener("loadedmetadata", handleLoaded);
          videoElement.addEventListener("error", handleError);

          // Timeout fallback jika loadedmetadata tidak pernah datang
          setTimeout(() => {
            if (!state.isInitialized) {
              const vw = videoElement.videoWidth || 0;
              const vh = videoElement.videoHeight || 0;
              setState((prev) => ({
                ...prev,
                videoWidth: vw,
                videoHeight: vh,
              }));
              resolve();
            }
          }, 1000);
        });

        await videoElement.play();
      }

      setState((prev) => ({
        ...prev,
        isInitialized: true,
        isPermissionDenied: false,
        isError: false,
        facingMode,
        isFrontCamera: facingMode === "user",
      }));
    } catch (err) {
      console.error("Camera error:", err);
      const isPermissionDenied =
        err instanceof DOMException &&
        err.name === "NotAllowedError";

      setState((prev) => ({
        ...prev,
        isError: true,
        isPermissionDenied,
        errorMessage: isPermissionDenied
          ? "Izin kamera ditolak. Silakan aktifkan izin kamera di pengaturan browser."
          : "Tidak dapat mengakses kamera. Pastikan kamera tersedia dan tidak digunakan aplikasi lain.",
      }));

      onError?.(
        isPermissionDenied
          ? "Izin kamera ditolak."
          : "Tidak dapat mengakses kamera."
      );
    }
  }, [facingMode, videoWidth, videoHeight, onError, state.isInitialized]);

  const switchCamera = useCallback(async () => {
    const newMode: CameraFacingMode =
      state.facingMode === "environment" ? "user" : "environment";
    setState((prev) => ({ ...prev, facingMode: newMode }));
    await startCamera();
  }, [state.facingMode, startCamera]);

  const capture = useCallback(
    async (): Promise<PhotoResult | null> => {
      if (!videoRef.current || !canvasRef.current) {
        return null;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Gunakan dimensi video aktual, fallback ke canvas size
      const vw = video.videoWidth || canvas.width || videoWidth;
      const vh = video.videoHeight || canvas.height || videoHeight;

      canvas.width = vw;
      canvas.height = vh;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        return null;
      }

      setState((prev) => ({ ...prev, isCapturing: true }));

      try {
        // Draw captured video frame
        ctx.drawImage(video, 0, 0, vw, vh);

        // Apply filter via canvas pixel manipulation
        const filterPreset = FILTER_PRESETS.find(
          (f) => f.key === currentFilter.key
        );
        if (filterPreset && Object.keys(filterPreset.canvasConfig).length > 0) {
          applyCanvasFilter(ctx, vw, vh, filterPreset.canvasConfig);
        }

        // Draw frame overlay if configured
        if (currentFrame) {
          await drawFrameOverlay(ctx, vw, vh, currentFrame);
        }

        // Export to blob
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), "image/webp", 0.92);
        });

        if (!blob) {
          throw new Error("Gagal mengekspor foto ke Blob");
        }

        const dataUrl = canvas.toDataURL("image/webp", 0.92);

        const result: PhotoResult = {
          blob,
          dataUrl,
          width: vw,
          height: vh,
          filterKey: currentFilter.key,
          frameId: currentFrame?.id ?? null,
        };

        setState((prev) => ({
          ...prev,
          isCapturing: false,
          hasCaptured: true,
        }));

        return result;
      } catch (err) {
        console.error("Capture error:", err);
        setState((prev) => ({
          ...prev,
          isCapturing: false,
          isError: true,
          errorMessage: "Gagal mengambil foto. Silakan coba lagi.",
        }));
        return null;
      }
    },
    [currentFilter, currentFrame, videoWidth, videoHeight]
  );

  const retake = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hasCaptured: false,
      isError: false,
      errorMessage: "",
    }));
  }, []);

  const setFilter = useCallback((filter: FilterPreset) => {
    setCurrentFilter(filter);
    if (videoRef.current) {
      videoRef.current.style.filter = filter.cssFilter;
    }
  }, []);

  const setFrame = useCallback((frame: FrameOption | null) => {
    setCurrentFrame(frame);
  }, []);

  const applyCanvasFilter = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    config: FilterPreset["canvasConfig"]
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const {
      brightness = 1,
      contrast = 1,
      saturate = 1,
      hueRotate = 0,
      sepia = 0,
      grayscale = 0,
    } = config;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      if (grayscale > 0) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = r * (1 - grayscale) + gray * grayscale;
        g = g * (1 - grayscale) + gray * grayscale;
        b = b * (1 - grayscale) + gray * grayscale;
      }

      if (sepia > 0) {
        const sr = r * (1 - sepia) + (r * 0.393 + g * 0.769 + b * 0.189) * sepia;
        const sg = g * (1 - sepia) + (r * 0.349 + g * 0.686 + b * 0.168) * sepia;
        const sb = b * (1 - sepia) + (r * 0.272 + g * 0.534 + b * 0.131) * sepia;
        r = sr; g = sg; b = sb;
      }

      r *= brightness;
      g *= brightness;
      b *= brightness;

      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;

      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const drawFrameOverlay = async (
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    frame: FrameOption
  ) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = frame.assetPath;
    });

    const scale = canvasWidth / frame.config.frameW;
    const photoW = frame.config.photoW * scale;
    const photoH = frame.config.photoH * scale;
    const photoX = frame.config.photoX * scale;
    const photoY = frame.config.photoY * scale;

    const frameH = frame.config.frameH * scale;
    const offsetY = (canvasHeight - frameH) / 2;

    ctx.drawImage(img, 0, offsetY, canvasWidth, frameH);

    // Re-draw photo on top of frame at photo viewport
    if (videoRef.current) {
      ctx.drawImage(
        videoRef.current,
        photoX,
        photoY,
        photoW,
        photoH
      );
    }
  };

  return {
    streamRef,
    videoRef,
    canvasRef,
    state,
    currentFilter,
    currentFrame,
    filters: FILTER_PRESETS,
    frames: DEFAULT_FRAMES,
    startCamera,
    switchCamera,
    capture,
    retake,
    setFilter,
    setFrame,
    stopStream,
  };
}
