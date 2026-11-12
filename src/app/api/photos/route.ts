import { NextRequest, NextResponse } from "next/server";
import {
  getPhotosByEventId,
  type Photo,
} from "@/lib/storage";

/**
 * GET /api/photos?eventId=xxx&status=published
 * Daftar foto untuk suatu acara.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const eventId = searchParams.get("eventId");
  const status = searchParams.get("status") as Photo["status"] | null;

  if (!eventId) {
    return NextResponse.json(
      { success: false, error: "eventId diperlukan." },
      { status: 400 }
    );
  }

  try {
    const photos = await getPhotosByEventId(eventId, status ?? undefined);
    return NextResponse.json({ success: true, data: photos });
  } catch (err) {
    console.error("Get photos error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar foto." },
      { status: 500 }
    );
  }
}
