import { notFound } from "next/navigation";
import { getEventBySlug, getPhotosByEventId } from "@/lib/storage";
import { Gallery } from "@/components/gallery/GalleryLightbox";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;

  const event = await getEventBySlug(eventSlug);
  if (!event) {
    notFound();
  }

  const photos = await getPhotosByEventId(event.id, "published");

  const clientPhotos = photos.map((p: any) => ({
    id: p.id,
    storage_path: p.storage_path,
    eventId: p.event_id,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-sj-bg-soft text-sj-brand">
      <header className="px-4 py-4 bg-white border-b border-sj-border sticky top-0 z-20">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <a
            href={`/e/${event.slug}`}
            className="flex items-center gap-2 text-sj-brand font-semibold hover:opacity-80 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </a>
          <span className="text-sm font-semibold">{event.name}</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 max-w-md mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Galeri Foto</h2>
            <span className="text-xs font-medium text-sj-muted">
              {photos.length} foto
            </span>
          </div>

          {photos.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-sj-brand/10 flex items-center justify-center text-sj-brand mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Belum ada foto</h3>
              <p className="text-sj-muted">Belum ada foto yang dipublikasikan untuk acara ini.</p>
              <a
                href={`/e/${event.slug}/camera`}
                className="mt-6 sj-btn-primary w-full"
              >
                Mulai Foto
              </a>
            </div>
          ) : (
            <Gallery photos={clientPhotos} eventId={event.id} />
          )}
        </div>
      </main>
    </div>
  );
}
