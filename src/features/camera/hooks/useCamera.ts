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

  useEffect(() => {
    checkAvailableDevices();
  }, [checkAvailableDevices]);

  const resolveFacingMode = useCallback(
    (requested: CameraFacingMode): CameraFacingMode => {
      const available = state.availableDevices;
      if (available.length === 0) {
        return requested;
      }

      const hasRequested = available.some((d) => d.facing === requested);
      if (hasRequested) {
        return requested;
      }

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

  const startCamera = useCallback(async (attempt = 0) => {
    stopStream();

    setState((prev) => ({
      ...prev,
      isError: false,
      errorMessage: "",
      errorName: null,
      isCapturing: false,
      hasCaptured: false,
    }));

    // enumerateDevices sering mengembalikan kosong di mobile sebelum izin.
    // Jangan treat sebagai error — lanjutkan ke getUserMedia.
    let resolvedMode = facingMode;
    if (state.availableDevices.length > 0) {
      resolvedMode = resolveFacingMode(facingMode);
    }

    const buildConstraints = (useFacingMode: boolean): MediaStreamConstraints => ({
      audio: false,
      video: {
        ...(useFacingMode ? { facingMode: resolvedMode } : {}),
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
    });

    let lastError: any = null;

    // Coba dengan facingMode dulu, lalu tanpa facingMode sebagai fallback terakhir
    const attempts = state.availableDevices.length > 0 ? [true, false] : [false];

    for (const useFacingMode of attempts) {
      try {
        console.log(
          `Camera attempt ${attempt + 1}: facingMode=${
            useFacingMode ? resolvedMode : "default"
          }`
        );

        const constraints = buildConstraints(useFacingMode);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length === 0) {
          stream.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
          throw new Error("Stream tidak memiliki video track");
        }

        const videoTrack = videoTracks[0];
        const settings = videoTrack.getSettings();
        console.log("Camera track settings:", settings);
        console.log("Camera track label:", videoTrack.label);
        console.log("Camera deviceId:", settings.deviceId);
        console.log("Camera facingMode:", settings.facingMode);

        const videoElement = videoRef.current;
        if (!videoElement) {
          stream.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
          throw new Error("Video element tidak tersedia");
        }

        videoElement.srcObject = stream;

        await new Promise<void>((resolve, reject) => {
          const handleLoaded = () => {
            videoElement.removeEventListener("loadedmetadata", handleLoaded);
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

          setTimeout(() => {
            const vw = videoElement.videoWidth || 0;
            const vh = videoElement.videoHeight || 0;
            setState((prev) => ({
              ...prev,
              videoWidth: vw,
              videoHeight: vh,
            }));
            resolve();
          }, 3000);
        });

        try {
          await videoElement.play();
        } catch (playErr) {
          console.error("Video play error:", playErr);
          setTimeout(async () => {
            try {
              await videoElement.play();
            } catch (retryErr) {
              console.error("Video play retry failed:", retryErr);
            }
          }, 500);
        }

        const detectedFacing =
          settings.facingMode === "user" ? "user" : "environment";

        setState((prev) => ({
          ...prev,
          isInitialized: true,
          isPermissionDenied: false,
          isError: false,
          errorMessage: "",
          errorName: null,
          facingMode: detectedFacing,
          isFrontCamera: detectedFacing === "user",
        }));

        return;
      } catch (err) {
        lastError = err;
        console.error(
          `Camera attempt ${attempt + 1} (facingMode=${useFacingMode}) failed:`,
          err
        );

        if (err instanceof DOMException && err.name === "NotAllowedError") {
          break;
        }
      }
    }

    console.error("Camera error:", lastError);

    let errorName = "";
    let errorMessage = "";
    let isPermissionDenied = false;

    if (lastError instanceof DOMException) {
      errorName = lastError.name;
      switch (lastError.name) {
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
            "Constraint kamera tidak didukung perangkat. Coba ganti kamera.";
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
          errorMessage = `Terjadi kesalahan kamera: ${lastError.message}`;
      }
    } else if (lastError instanceof Error) {
      errorMessage = lastError.message;
    } else {
      errorMessage = "Terjadi kesalahan tidak diketahui saat mengakses kamera.";
    }

    setState((prev) => ({
      ...prev,
      isError: true,
      isPermissionDenied,
      errorMessage,
      errorName,
    }));

    onError?.(errorMessage, errorName);
  }, [facingMode, videoWidth, videoHeight, onError, state.availableDevices, resolveFacingMode]);

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
        ctx.drawImage(video, 0, 0, vw, vh);

        const filterPreset = FILTER_PRESETS.find(
          (f) => f.key === currentFilter.key
        );
        if (filterPreset && Object.keys(filterPreset.canvasConfig).length > 0) {
          applyCanvasFilter(ctx, vw, vh, filterPreset.canvasConfig);
        }

        if (currentFrame) {
          await drawFrameOverlay(ctx, vw, vh, currentFrame);
        }

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
        const sr =
          r * (1 - sepia) + (r * 0.393 + g * 0.769 + b * 0.189) * sepia;
        const sg =
          g * (1 - sepia) + (r * 0.349 + g * 0.686 + b * 0.168) * sepia;
        const sb =
          b * (1 - sepia) + (r * 0.272 + g * 0.534 + b * 0.131) * sepia;
        r = sr;
        g = sg;
        b = sb;
      }

      r *= brightness;
      g *= brightness;
      b *= brightness;

      const contrastFactor =
        (259 * (contrast + 255)) / (255 * (259 - contrast));
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

    if (videoRef.current) {
      ctx.drawImage(videoRef.current, photoX, photoY, photoW, photoH);
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
