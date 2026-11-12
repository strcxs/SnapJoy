export type CameraFacingMode = "user" | "environment";

export type FilterPreset = {
  key: string;
  label: string;
  cssFilter: string;
  canvasConfig: {
    brightness?: number;
    contrast?: number;
    saturate?: number;
    hueRotate?: number;
    sepia?: number;
    grayscale?: number;
  };
};

export const FILTER_PRESETS: FilterPreset[] = [
  {
    key: "original",
    label: "Asli",
    cssFilter: "none",
    canvasConfig: {},
  },
  {
    key: "warm",
    label: "Warm",
    cssFilter: "brightness(1.05) contrast(1.02) saturate(1.15)",
    canvasConfig: { brightness: 1.05, contrast: 1.02, saturate: 1.15 },
  },
  {
    key: "vintage",
    label: "Vintage",
    cssFilter: "brightness(0.95) contrast(1.1) saturate(0.85) sepia(0.3)",
    canvasConfig: { brightness: 0.95, contrast: 1.1, saturate: 0.85, sepia: 0.3 },
  },
  {
    key: "bw",
    label: "Hitam Putih",
    cssFilter: "grayscale(1) contrast(1.15)",
    canvasConfig: { grayscale: 1, contrast: 1.15 },
  },
  {
    key: "retro",
    label: "Retro",
    cssFilter: "brightness(1.02) contrast(1.15) saturate(1.25) hue-rotate(-5deg) sepia(0.15)",
    canvasConfig: { brightness: 1.02, contrast: 1.15, saturate: 1.25, hueRotate: -5, sepia: 0.15 },
  },
];

export type FrameOption = {
  id: string;
  name: string;
  assetPath: string;
  previewPath?: string;
  config: {
    photoX: number;
    photoY: number;
    photoW: number;
    photoH: number;
    frameW: number;
    frameH: number;
  };
};

export const DEFAULT_FRAMES: FrameOption[] = [
  {
    id: "classic",
    name: "Klasik",
    assetPath: "/frames/classic.png",
    config: {
      photoX: 0,
      photoY: 0,
      photoW: 1000,
      photoH: 1000,
      frameW: 1000,
      frameH: 1000,
    },
  },
];

export interface CameraState {
  isInitialized: boolean;
  isPermissionDenied: boolean;
  isError: boolean;
  errorMessage: string;
  facingMode: CameraFacingMode;
  isFrontCamera: boolean;
  isCapturing: boolean;
  hasCaptured: boolean;
  isUploading: boolean;
  currentFilter: string;
  currentFrame: string;
}

export interface PhotoResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  filterKey: string;
  frameId: string | null;
}
