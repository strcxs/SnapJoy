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
  onError?: (message: string, errorName?: string) => void;
}

interface CameraDevice {
  deviceId: string;
  kind: string;
  label: string;
  facing?: CameraFacingMode;
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
    errorName: string | null;
    facingMode: CameraFacingMode;
    isFrontCamera: boolean;
    isCapturing: boolean;
    hasCaptured: boolean;
    isUploading: boolean;
    videoWidth: number;
    videoHeight: number;
    availableDevices: CameraDevice[];
    isCheckingDevices: boolean;
  }>({
    isInitialized: false,
    isPermissionDenied: false,
    isError: false,
    errorMessage: "",
    errorName: null,
    facingMode,
    isFrontCamera: facingMode === "user",
    isCapturing: false,
    hasCaptured: false,
    isUploading: false,
    videoWidth: 0,
    videoHeight: 0,
    availableDevices: [],
    isCheckingDevices: false,
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

  /**
   * Deteksi perangkat kamera yang tersedia melalui enumerateDevices.
   * Digunakan untuk mengetahui apakah ada kamera fisik dan fallback otomatis.
   */
  const checkAvailableDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return;
    }

    setState((prev) => ({ ...prev, isCheckingDevices: true }));

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices: CameraDevice[] = devices
        .filter((d) => d.kind === "videoinput")
        .map((d) => {
          // Heuristik deteksi depan/belakang berdasarkan label
          const label = (d.label || "").toLowerCase();
          let facing: CameraFacingMode = "environment";
          if (
            label.includes("front") ||
            label.includes("selfie") ||
            label.includes("user")
          ) {
            facing = "user";
          } else if (
            label.includes("back") ||
            label.includes("rear") ||
            label.includes("environment")
          ) {
            facing = "environment";
          }
          return {
            deviceId: d.deviceId,
            kind: d.kind,
            label: d.label || "Kamera tidak diketahui",
            facing,
          };
        });

      setState((prev) => ({
        ...prev,
        availableDevices: videoDevices,
        isCheckingDevices: false,
      }));
    } catch (err) {
      console.error("Device enumeration error:", err);
      setState((prev) => ({
        ...prev,
        isCheckingDevices: false,
      }));
    }
  }, []);

  // Cek perangkat saat mount
  useEffect(() => {
    checkAvailableDevices();
  }, [checkAvailableDevices]);

  /**
   * Tentukan facingMode yang akan digunakan dengan fallback otomatis.
   * Jika facingMode yang diminta tidak tersedia dalam daftar perangkat,
   * coba yang lainnya.
   */
  const resolveFacingMode = useCallback(
    (requested: CameraFacingMode): CameraFacingMode => {
      const available = state.availableDevices;
      if (available.length === 0) {
        // Tidak ada info perangkat, coba requested mode dulu
        return requested;
      }

      const hasRequested = available.some((d) => d.facing === requested);
      if (hasRequested) {
        return requested;
      }

      // Fallback ke mode lain
      const alternative: CameraFacingMode =
        requested === "environment" ? "user" : "environment";
      const hasAlternative = available.some((d) => d.facing === alternative);
      if (hasAlternative) {
        return alternative;
      }

      return requested;
    },
    [state.availableDevices]
  );

  const startCamera = useCallback(async () => {
    stopStream();

    setState((prev) => ({
      ...prev,
      isError: false,
      errorMessage: "",
      errorName: null,
      isCapturing: false,
      hasCaptured: false,
    }));

    // Resolve facingMode dengan fallback otomatis
    const resolvedMode = resolveFacingMode(facingMode);

    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: resolvedMode,
          width: {
            min: 640,
            ideal: videoWidth,
            max: 1920,
          },
          height: {
            min: 480,
            ideal: videoHeight,
            max: 2560,
          },
        },
      };

      console.log("Camera constraints:", constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Verifikasi stream memiliki video track
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length === 0) {
        throw new Error("Stream tidak memiliki video track");
      }

      const videoTrack = videoTracks[0];
      const settings = videoTrack.getSettings();
      console.log("Camera track settings:", settings);
      console.log("Camera track label:", videoTrack.label);
      console.log("Camera deviceId:", settings.deviceId);

      const videoElement = videoRef.current;
      if (!videoElement) {
        throw new Error("Video element tidak tersedia");
      }

      videoElement.srcObject = stream;

      // Tunggu loadedmetadata untuk mendapatkan dimensi video aktual
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
        }, 2000);
      });

      // Putar video dengan error handling
      try {
        await videoElement.play();
      } catch (playErr) {
        console.error("Video play error:", playErr);
        // Autoplay mungkin diblokir, coba lagi setelah jeda
        setTimeout(async () => {
          try {
            await videoElement.play();
          } catch (retryErr) {
            console.error("Video play retry failed:", retryErr);
          }
        }, 500);
      }

      setState((prev) => ({
        ...prev,
        isInitialized: true,
        isPermissionDenied: false,
        isError: false,
        errorMessage: "",
        errorName: null,
        facingMode: resolvedMode,
        isFrontCamera: resolvedMode === "user",
      }));
    } catch (err) {
      console.error("Camera error:", err);

      let errorName = "";
      let errorMessage = "";
      let isPermissionDenied = false;

      if (err instanceof DOMException) {
        errorName = err.name;
        switch (err.name) {
          case "NotAllowedError":
            isPermissionDenied = true;
            errorMessage =
              "Izin kamera ditolak. Silakan aktifkan izin kamera di pengaturan browser dan coba lagi.";
            break;
          case "NotFoundError":
            errorMessage =
              "Kamera tidak ditemukan. Pastikan perangkat Anda memiliki kamera dan tidak digunakan aplikasi lain.";
            break;
          case "NotReadableError":
            errorMessage =
              "Kamera tidak dapat diakses. Mungkin sedang digunakan aplikasi lain atau terkunci.";
            break;
          case "OverconstrainedError":
            errorMessage =
              "Constraint kamera tidak didukung perangkat. Mencoba dengan pengaturan default…";
            break;
          case "TypeError":
            errorMessage =
              "Parameter kamera tidak valid. Silakan coba kamera lain.";
            break;
          case "SecurityError":
            errorMessage =
              "Akses kamera diblokir untuk alasan keamanan. Gunakan HTTPS atau localhost.";
            break;
          default:
            errorMessage = `Terjadi kesalahan kamera: ${err.message}`;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = "Terjadi kesalahan tidak diketahui saat mengakses kamera.";
      }

      // Coba fallback ke kamera lain jika NotFoundError atau OverconstrainedError
      const canFallback =
        errorName === "NotFoundError" ||
        errorName === "OverconstrainedError" ||
        errorName === "TypeError";

      if (canFallback && resolvedMode !== facingMode === false) {
        const alternative: CameraFacingMode =
          resolvedMode === "environment" ? "user" : "environment";
        const hasAlt = state.availableDevices.some(
          (d) => d.facing === alternative
        );

        if (hasAlt || state.availableDevices.length === 0) {
          // Set timeout lalu coba fallback
          setTimeout(async () => {
            setState((prev) => ({
              ...prev,
              facingMode: alternative,
              isFrontCamera: alternative === "user",
            }));
            await startCamera();
          }, 1000);
          return;
        }
      }

      setState((prev) => ({
        ...prev,
        isError: true,
        isPermissionDenied,
        errorMessage,
        errorName,
      }));

      onError?.(errorMessage, errorName);
    }
  }, [facingMode, videoWidth, videoHeight, onError, state.availableDevices, resolveFacingMode, state.isInitialized]);

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

      if (vw === 0 || vh === 0) {
        return null;
      }

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
