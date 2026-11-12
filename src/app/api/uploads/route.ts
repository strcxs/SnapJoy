import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

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
  thumbnailPath?: string | null;
  status?: string;
  error?: string;
}

/**
 * POST /api/uploads
 * Upload foto untuk suatu acara.
 *
 * Flow:
 * 1. Validasi event (exists, active, allow_upload).
 * 2. Validasi ukuran dan tipe file.
 * 3. Upload ke Supabase Storage private bucket.
 * 4. Buat metadata foto di tabel `photos`.
 * 5. Kembalikan metadata atau error.
 */
export async function POST(req: NextRequest): Promise<NextResponse<UploadResult>> {
  const supabase = await createServerClient();

  try {
    const formData = await req.formData();

    const eventId = formData.get("eventId") as string;
    const guestSessionId = (formData.get("guestSessionId") as string) ?? null;
    const filterKey = (formData.get("filterKey") as string) ?? null;
    const frameId = (formData.get("frameId") as string) ?? null;
    const capturedAt = (formData.get("capturedAt") as string) ?? null;
    const file = formData.get("file") as File | null;

    if (!eventId || !file) {
      return NextResponse.json(
        { success: false, error: "Event ID dan file foto wajib diisi." },
        { status: 400 }
      );
    }

    // --- 1. Validasi event ---
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, slug, status, allow_upload")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: "Acara tidak ditemukan." },
        { status: 404 }
      );
    }

    if (event.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Acara belum aktif atau telah ditutup untuk upload." },
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
        { success: false, error: `File terlalu besar. Maksimal ${MAX_FILE_SIZE_MB} MB.` },
        { status: 400 }
      );
    }

    // --- 3. Ambil event settings untuk moderation_mode ---
    const { data: settings } = await supabase
      .from("event_settings")
      .select("moderation_mode")
      .eq("event_id", eventId)
      .single();

    const moderationMode = settings?.moderation_mode ?? "manual_approval";
    const initialStatus = moderationMode === "auto_publish" ? "published" : "pending";

    // --- 4. Upload file ke private storage bucket ---
    const fileExt = file.name.split(".").pop() ?? "webp";
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const storagePath = `events/${eventId}/photos/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Gagal mengunggah file ke penyimpanan. Silakan coba lagi." },
        { status: 500 }
      );
    }

    // --- 5. Buat metadata foto ---
    const { data: photo, error: photoError } = await supabase
      .from("photos")
      .insert({
        event_id: eventId,
        storage_path: storagePath,
        thumbnail_path: null,
        mime_type: file.type,
        file_size_bytes: file.size,
        width: 0,
        height: 0,
        status: initialStatus,
        guest_session_id: guestSessionId ?? null,
        filter_key: filterKey ?? null,
        frame_id: frameId ?? null,
        captured_at: capturedAt ?? null,
      })
      .select()
      .single();

    if (photoError) {
      console.error("Photo insert error:", photoError);
      // Cleanup orphan file
      await supabase.storage.from("photos").remove([storagePath]);
      return NextResponse.json(
        { success: false, error: "Gagal menyimpan metadata foto." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      photoId: photo.id,
      storagePath: photo.storage_path,
      thumbnailPath: photo.thumbnail_path,
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
