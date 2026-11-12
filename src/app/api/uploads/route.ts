import { NextRequest, NextResponse } from "next/server";
import { savePhoto } from "@/lib/storage";

/**
 * Allowed MIME types for photo uploads.
 */
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 16;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface UploadResult {
  success: boolean;
  photoId?: string;
  storagePath?: string;
  status?: string;
  error?: string;
}

/**
 * POST /api/uploads
 * Upload foto untuk suatu acara menggunakan penyimpanan internal.
 *
 * Flow:
 * 1. Validasi event (exists, active, allow_upload).
 * 2. Validasi ukuran dan tipe file.
 * 3. Simpan file ke storage lokal (storage/uploads/{eventId}/).
 * 4. Buat metadata foto di photos.json.
 * 5. Kembalikan metadata atau error.
 */
export async function POST(req: NextRequest): Promise<NextResponse<UploadResult>> {
  try {
    const formData = await req.formData();

    const eventId = formData.get("eventId") as string;
    const guestSessionId = (formData.get("guestSessionId") as string) ?? null;
    const filterKey = (formData.get("filterKey") as string) ?? null;
    const frameId = (formData.get("frameId") as string) ?? null;
    const capturedAt = (formData.get("capturedAt") as string) ?? null;
    const moderationMode = (formData.get("moderationMode") as string) ??
      "manual_approval";
    const file = formData.get("file") as File | null;

    if (!eventId || !file) {
      return NextResponse.json(
        { success: false, error: "Event ID dan file foto wajib diisi." },
        { status: 400 }
      );
    }

    // --- 1. Validasi event ---
    const { getEventById } = await import("@/lib/storage");
    const event = await getEventById(eventId);

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Acara tidak ditemukan." },
        { status: 404 }
      );
    }

    if (event.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: "Acara belum aktif atau telah ditutup untuk upload.",
        },
        { status: 403 }
      );
    }

    if (!event.allow_upload) {
      return NextResponse.json(
        { success: false, error: "Upload foto tidak diizinkan untuk acara ini." },
        { status: 403 }
      );
    }

    // --- 2. Validasi file ---
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Format file tidak didukung. Gunakan JPEG, PNG, atau WebP. (diterima: ${file.type})`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File terlalu besar. Maksimal ${MAX_FILE_SIZE_MB} MB.`,
        },
        { status: 400 }
      );
    }

    // --- 3. Simpan file dan metadata ---
    const fileExt = file.name.split(".").pop() ?? "webp";
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const photo = await savePhoto(
      eventId,
      buffer,
      fileName,
      file.type,
      {
        guestSessionId: guestSessionId ?? undefined,
        filterKey: filterKey ?? undefined,
        frameId: frameId ?? undefined,
        capturedAt: capturedAt ?? undefined,
        moderationMode:
          moderationMode === "auto_publish" ? "auto_publish" : "manual_approval",
      }
    );

    return NextResponse.json({
      success: true,
      photoId: photo.id,
      storagePath: photo.storage_path,
      status: photo.status,
    });
  } catch (err) {
    console.error("Upload API error:", err);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server saat mengunggah." },
      { status: 500 }
    );
  }
}
