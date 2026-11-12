export default function EventLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-sj-bg-soft text-sj-brand">
      <header className="px-4 py-4 bg-white border-b border-sj-border">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="w-8 h-8 rounded-lg bg-sj-accent flex items-center justify-center text-sj-brand font-bold text-xs">
            SQ
          </div>
          <span className="text-sm font-bold tracking-tight">Snapjoy</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 max-w-md mx-auto">
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-sj-brand border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-sj-muted">Memuat acara…</p>
          </div>
        </div>
      </main>
    </div>
  );
}
