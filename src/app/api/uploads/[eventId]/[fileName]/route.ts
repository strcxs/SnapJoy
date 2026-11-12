import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

const STORAGE_ROOT = process.env.STORAGE_ROOT || join(process.cwd(), "storage");

/**
 * GET /api/uploads/[eventId]/[fileName]
 * Layani file foto yang telah diunggah dari penyimpanan internal.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string; fileName: string }> }
) {
  const { eventId, fileName } = await params;

  try {
    const filePath = join(
      STORAGE_ROOT,
      "uploads",
      eventId,
      decodeURIComponent(fileName)
    );

    const fileBuffer = await readFile(filePath);

    // Deteksi content type dari ekstensi file
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    const contentTypeMap: Record<string, string> = {
      webp: "image/webp",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
    };
    const contentType = contentTypeMap[ext] ?? "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Serve file error:", err);
    return NextResponse.json(
      { success: false, error: "File tidak ditemukan." },
      { status: 404 }
    );
  }
}
