import { NextRequest, NextResponse } from "next/server";
import {
  getEvents,
  createEvent,
  type Event,
} from "@/lib/storage";

/**
 * GET /api/events
 * Daftar semua acara.
 */
export async function GET() {
  try {
    const events = await getEvents();
    return NextResponse.json({ success: true, data: events });
  } catch (err) {
    console.error("Get events error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar acara." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * Buat acara baru.
 * Body: { name, slug, description, status, visibility, allow_upload, ... }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      slug,
      description,
      venue_name,
      starts_at,
      ends_at,
      timezone = "Asia/Jakarta",
      status = "active",
      visibility = "public",
      allow_upload = true,
      allow_gallery = true,
      moderation_mode = "manual_approval",
      max_file_size_mb = 16,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Nama dan slug acara wajib diisi." },
        { status: 400 }
      );
    }

    // Cek apakah slug sudah ada
    const existing = await getEvents();
    if (existing.some((e) => e.slug === slug)) {
      return NextResponse.json(
        { success: false, error: "Slug acara sudah digunakan." },
        { status: 409 }
      );
    }

    const newEvent: Omit<Event, "id" | "created_at" | "updated_at"> = {
      name,
      slug,
      description: description ?? null,
      venue_name: venue_name ?? null,
      starts_at: starts_at ?? null,
      ends_at: ends_at ?? null,
      timezone,
      status,
      visibility,
      allow_upload,
      allow_gallery,
      moderation_mode,
      max_file_size_mb,
    };

    const event = await createEvent(newEvent);
    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (err) {
    console.error("Create event error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal membuat acara." },
      { status: 500 }
    );
  }
}
