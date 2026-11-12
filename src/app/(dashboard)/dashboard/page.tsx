"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Event {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: string;
  visibility: string;
  allow_upload: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "active",
    visibility: "public",
    allow_upload: true,
  });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await fetch("/api/events", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (err) {
      setError("Gagal memuat daftar acara.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess("Acara berhasil dibuat!");
        setFormData({
          name: "",
          slug: "",
          description: "",
          status: "active",
          visibility: "public",
          allow_upload: true,
        });
        setShowForm(false);
        await fetchEvents();
      } else {
        setError(data.error || "Gagal membuat acara.");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat membuat acara.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-sj-bg-soft text-sj-brand">
        <header className="px-4 py-4 bg-white border-b border-sj-border">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <span className="text-sm font-bold tracking-tight">Snapjoy</span>
            <a href="/" className="text-xs font-medium text-sj-muted hover:text-sj-brand transition-colors">
              Kembali ke Beranda
            </a>
          </div>
        </header>
        <main className="flex-1 px-4 py-12 max-w-md mx-auto">
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-sj-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sj-muted">Memuat daftar acara…</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-sj-bg-soft text-sj-brand">
      <header className="px-4 py-4 bg-white border-b border-sj-border sticky top-0 z-20">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm font-bold tracking-tight">Snapjoy</Link>
          <a href="/" className="text-xs font-medium text-sj-muted hover:text-sj-brand transition-colors">
            Kembali ke Beranda
          </a>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 max-w-md mx-auto">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Dashboard Acara</h1>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowForm(!showForm)}
              className="sj-btn-primary w-full"
            >
              {showForm ? "Batal" : "+ Buat Acara Baru"}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-800 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-green-800 text-sm">
              {success}
            </div>
          )}

          {showForm && (
            <div className="sj-card space-y-4">
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="sj-label">Nama Acara</label>
                  <input
                    className="sj-input"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Contoh: Pernikahan Andi & Sinta"
                  />
                </div>
                <div>
                  <label className="sj-label">Slug URL</label>
                  <input
                    className="sj-input"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="pernikahan-andi-sinta"
                  />
                </div>
                <div>
                  <label className="sj-label">Deskripsi</label>
                  <textarea
                    className="sj-input"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Deskripsi singkat tentang acara"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="sj-label">Status</label>
                    <select
                      className="sj-input"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Aktif</option>
                    </select>
                  </div>
                  <div>
                    <label className="sj-label">Visibilitas</label>
                    <select
                      className="sj-input"
                      value={formData.visibility}
                      onChange={(e) =>
                        setFormData({ ...formData, visibility: e.target.value })
                      }
                    >
                      <option value="public">Public</option>
                      <option value="unlisted">Unlisted</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-sj-border text-sj-brand focus:ring-sj-brand"
                    checked={formData.allow_upload}
                    onChange={(e) =>
                      setFormData({ ...formData, allow_upload: e.target.checked })
                    }
                  />
                  <label className="ml-2 text-sm text-sj-brand">
                    Izinkan upload foto
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="sj-btn-primary w-full"
                >
                  {creating ? "Membuat…" : "Buat Acara"}
                </button>
              </form>
            </div>
          )}

          <h2 className="text-lg font-semibold">Daftar Acara</h2>
          {events.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sj-muted">Belum ada acara. Buat acara pertama Anda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="sj-card flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-semibold">{event.name}</h3>
                    <p className="text-xs text-sj-muted">
                      {event.slug} · {event.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {event.status}
                    </span>
                    <Link
                      href={`/e/${event.slug}/gallery`}
                      className="text-sj-brand text-sm font-medium hover:underline"
                    >
                      Lihat Galeri
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
