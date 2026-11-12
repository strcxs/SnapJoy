import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-sj-bg-soft text-sj-brand">
      <header className="px-4 py-4 bg-white border-b border-sj-border sticky top-0 z-20">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <span className="text-sm font-bold tracking-tight">Snapjoy</span>
          <a
            href="/dashboard"
            className="text-xs font-medium text-sj-muted hover:text-sj-brand transition-colors"
          >
            Dashboard Pemilik
          </a>
        </div>
      </header>

      <main className="flex-1 px-4 py-12 max-w-md mx-auto">
        <div className="text-center space-y-8">
          <div className="w-20 h-20 rounded-2xl bg-sj-accent flex items-center justify-center text-sj-brand font-bold text-2xl shadow-lg mx-auto mb-4">
            SQ
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Snapjoy
          </h1>
          <p className="text-lg text-sj-muted max-w-sm mx-auto leading-relaxed">
            Platform photo booth berbasis web untuk acara Anda. Tamu memindai
            QR, mengambil foto dengan frame dan filter, lalu mengunggah ke
            galeri bersama — tanpa instalasi aplikasi.
          </p>

          <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
            <Link href="#" className="sj-btn-primary w-full">
              Buat Acara Baru
            </Link>
            <Link href="#" className="sj-btn-outline w-full">
              Lihat Contoh Galeri
            </Link>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-white border border-sj-border text-sm">
            <h3 className="font-semibold mb-2">Cara Kerja</h3>
            <ol className="text-sj-muted space-y-2 list-decimal list-inside">
              <li>Pemilik membuat acara dan mencetak QR Code</li>
              <li>Tamu memindai QR dari browser ponsel</li>
              <li>Ambil foto dengan filter dan frame acara</li>
              <li>Foto muncul di galeri bersama secara realtime</li>
            </ol>
          </div>
        </div>
      </main>

      <footer className="px-4 py-8 bg-white border-t border-sj-border">
        <div className="max-w-md mx-auto text-center text-xs text-sj-muted">
          Snapjoy — Capture the moment, share the joy.
        </div>
      </footer>
    </div>
  );
}
