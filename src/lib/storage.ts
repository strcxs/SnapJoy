import { writeFile, readFile, mkdir, readdir, unlink, stat } from "fs/promises";
import { join } from "path";

const STORAGE_ROOT = process.env.STORAGE_ROOT || join(process.cwd(), "storage");
const EVENTS_FILE = join(STORAGE_ROOT, "events.json");
const PHOTOS_FILE = join(STORAGE_ROOT, "photos.json");
const UPLOADS_DIR = join(STORAGE_ROOT, "uploads");

/**
 * Tipe data Event
 */
export interface Event {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  venue_name?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  timezone?: string;
  status: "draft" | "scheduled" | "active" | "completed" | "archived";
  visibility: "public" | "unlisted" | "private";
  allow_upload: boolean;
  allow_gallery: boolean;
  moderation_mode: "auto_publish" | "manual_approval";
  max_file_size_mb: number;
  created_at: string;
  updated_at: string;
}

/**
 * Tipe data Photo
 */
export interface Photo {
  id: string;
  event_id: string;
  storage_path: string;
  thumbnail_path?: string | null;
  mime_type: string;
  file_size_bytes: number;
  width: number;
  height: number;
  status: "pending" | "published" | "rejected" | "hidden" | "deleted";
  guest_session_id?: string | null;
  filter_key?: string | null;
  frame_id?: string | null;
  captured_at?: string | null;
  uploaded_at: string;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Pastikan direktori penyimpanan ada
 */
async function ensureDirs() {
  await mkdir(STORAGE_ROOT, { recursive: true });
  await mkdir(UPLOADS_DIR, { recursive: true });
}

/**
 * Baca daftar events dari file JSON
 */
async function readEvents(): Promise<Event[]> {
  await ensureDirs();
  try {
    const data = await readFile(EVENTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Tulis daftar events ke file JSON
 */
async function writeEvents(events: Event[]) {
  await ensureDirs();
  await writeFile(EVENTS_FILE, JSON.stringify(events, null, 2));
}

/**
 * Baca daftar photos dari file JSON
 */
async function readPhotos(): Promise<Photo[]> {
  await ensureDirs();
  try {
    const data = await readFile(PHOTOS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Tulis daftar photos ke file JSON
 */
async function writePhotos(photos: Photo[]) {
  await ensureDirs();
  await writeFile(PHOTOS_FILE, JSON.stringify(photos, null, 2));
}

/**
 * Simpan file foto ke sistem file lokal
 */
export async function savePhotoFile(
  eventId: string,
  fileBuffer: Buffer,
  fileName: string
): Promise<{ path: string; url: string }> {
  await ensureDirs();
  const eventDir = join(UPLOADS_DIR, eventId);
  await mkdir(eventDir, { recursive: true });

  const filePath = join(eventDir, fileName);
  const relativePath = `uploads/${eventId}/${fileName}`;
  const url = `/api/uploads/${eventId}/${fileName}`;

  await writeFile(filePath, fileBuffer);

  return { path: relativePath, url };
}

/**
 * Hapus file foto dari sistem file lokal
 */
export async function deletePhotoFile(filePath: string): Promise<void> {
  try {
    const fullPath = join(STORAGE_ROOT, filePath);
    await unlink(fullPath);
  } catch {
    // File mungkin sudah tidak ada, abaikan
  }
}

/* ========================================================================
   EVENT OPERATIONS
   ======================================================================== */

/**
 * Dapatkan semua events
 */
export async function getEvents(): Promise<Event[]> {
  return readEvents();
}

/**
 * Dapatkan event berdasarkan slug
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  const events = await readEvents();
  return events.find((e) => e.slug === slug) ?? null;
}

/**
 * Dapatkan event berdasarkan ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  const events = await readEvents();
  return events.find((e) => e.id === id) ?? null;
}

/**
 * Buat event baru
 */
export async function createEvent(eventData: Omit<Event, "id" | "created_at" | "updated_at">): Promise<Event> {
  const events = await readEvents();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newEvent: Event = {
    ...eventData,
    id,
    created_at: now,
    updated_at: now,
  };

  events.push(newEvent);
  await writeEvents(events);

  return newEvent;
}

/**
 * Update event
 */
export async function updateEvent(
  id: string,
  updates: Partial<Event>
): Promise<Event | null> {
  const events = await readEvents();
  const index = events.findIndex((e) => e.id === id);

  if (index === -1) {
    return null;
  }

  events[index] = {
    ...events[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  await writeEvents(events);
  return events[index];
}

/* ========================================================================
   PHOTO OPERATIONS
   ======================================================================== */

/**
 * Dapatkan semua photos untuk suatu event
 */
export async function getPhotosByEventId(
  eventId: string,
  status?: Photo["status"]
): Promise<Photo[]> {
  const photos = await readPhotos();
  let filtered = photos.filter((p) => p.event_id === eventId);

  if (status) {
    filtered = filtered.filter((p) => p.status === status);
  }

  return filtered.sort(
    (a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
  );
}

/**
 * Dapatkan photo berdasarkan ID
 */
export async function getPhotoById(id: string): Promise<Photo | null> {
  const photos = await readPhotos();
  return photos.find((p) => p.id === id) ?? null;
}

/**
 * Buat metadata photo baru
 */
export async function createPhoto(
  photoData: Omit<Photo, "id" | "uploaded_at" | "created_at" | "updated_at">
): Promise<Photo> {
  const photos = await readPhotos();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newPhoto: Photo = {
    ...photoData,
    id,
    uploaded_at: now,
    created_at: now,
    updated_at: now,
  };

  photos.push(newPhoto);
  await writePhotos(photos);

  return newPhoto;
}

/**
 * Update status photo (untuk moderasi)
 */
export async function updatePhotoStatus(
  id: string,
  status: Photo["status"],
  publishedAt?: string
): Promise<Photo | null> {
  const photos = await readPhotos();
  const index = photos.findIndex((p) => p.id === id);

  if (index === -1) {
    return null;
  }

  photos[index] = {
    ...photos[index],
    status,
    ...(publishedAt ? { published_at: publishedAt } : {}),
    updated_at: new Date().toISOString(),
  };

  await writePhotos(photos);
  return photos[index];
}

/**
 * Simpan file foto dan buat metadata
 */
export async function savePhoto(
  eventId: string,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  options: {
    guestSessionId?: string | null;
    filterKey?: string | null;
    frameId?: string | null;
    capturedAt?: string | null;
    moderationMode?: "auto_publish" | "manual_approval";
  }
): Promise<Photo> {
  const { path: storagePath, url } = await savePhotoFile(
    eventId,
    fileBuffer,
    fileName
  );

  const initialStatus =
    options.moderationMode === "auto_publish" ? "published" : "pending";

  return createPhoto({
    event_id: eventId,
    storage_path: storagePath,
    thumbnail_path: null,
    mime_type: mimeType,
    file_size_bytes: fileBuffer.length,
    width: 0,
    height: 0,
    status: initialStatus,
    guest_session_id: options.guestSessionId ?? null,
    filter_key: options.filterKey ?? null,
    frame_id: options.frameId ?? null,
    captured_at: options.capturedAt ?? null,
  });
}
