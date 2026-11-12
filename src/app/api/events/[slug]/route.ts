import { NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/storage";

/**
 * GET /api/events/[slug]
 * Dapatkan detail acara berdasarkan slug.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Acara tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: event });
  } catch (err) {
    console.error("Get event error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat detail acara." },
      { status: 500 }
    );
  }
}
