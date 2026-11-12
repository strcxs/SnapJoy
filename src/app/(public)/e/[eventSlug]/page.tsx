import Link from "next/link";
import Image from "next/image";

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  const eventName = decodeURIComponent(eventSlug.replace(/-/g, " "));

  return (
    <div className="flex flex-col min-h-screen bg-sj-bg-soft text-sj-brand">
      {/* Header */}
      <header className="px-4 py-4 bg-white border-b border-sj-border">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sj-accent flex items-center justify-center text-sj-brand font-bold text-xs">
              SQ
            </div>
            <span className="text-sm font-bold tracking-tight">Snapjoy</span>
          </Link>
          <a
            href="/dashboard"
            className="text-xs font-medium text-sj-muted hover:text-sj-brand transition-colors"
          >
            Masuk Pemilik
          </a>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 max-w-md mx-auto">
        <div className="text-center space-y-6">
          {/* Event badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-sj-border shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-sj-brand">Acara Aktif</span>
          </div>

          {/* Event info */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{eventName}</h1>
            <p className="text-lg text-sj-muted">
              Kami mengundang Anda untuk mengambil foto bersama dan menyumbangkan ke galeri acara.
            </p>
          </div>

          {/* QR / Info card */}
          <div className="sj-card">
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-2xl bg-sj-brand flex items-center justify-center text-white font-bold text-lg shadow-lg">
                QR
              </div>
              <p className="text-sm text-sj-muted">
                Scan QR di layar ini atau gunakan tombol di bawah untuk memulai foto.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <a
              href={`/e/${eventSlug}/camera`}
              className="sj-btn-primary w-full"
            >
              Mulai Foto
            </a>
          </div>

          <div className="mt-4">
            <Link
              href={`/e/${eventSlug}/gallery`}
              className="flex items-center justify-center gap-2 text-sm font-medium text-sj-muted hover:text-sj-brand transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Lihat Galeri
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-6 bg-white border-t border-sj-border">
        <div className="max-w-md mx-auto text-center text-xs text-sj-muted">
          Snapjoy — Capture the moment, share the joy. Tanpa instalasi aplikasi.
        </div>
      </footer>
    </div>
  );
}
