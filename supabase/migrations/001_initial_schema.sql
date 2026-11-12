-- ============================================
-- Snapjoy Database Migration v1
-- Tabel inti untuk Tahap 2 (Shared Gallery)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------
-- Tabel events
-- -------------------------------------------
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL, -- akan di-FK ke organizations di migrasi selanjutnya
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  venue_name TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'completed', 'archived')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_events_slug_unique ON events(slug);
CREATE INDEX idx_events_organization_id_status ON events(organization_id, status);
CREATE INDEX idx_events_slug_status ON events(slug, status);

-- -------------------------------------------
-- Tabel event_settings
-- -------------------------------------------
CREATE TABLE event_settings (
  event_id UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  allow_upload BOOLEAN NOT NULL DEFAULT true,
  allow_gallery BOOLEAN NOT NULL DEFAULT true,
  moderation_mode TEXT NOT NULL DEFAULT 'manual_approval' CHECK (moderation_mode IN ('auto_publish', 'manual_approval')),
  max_photos_per_session INTEGER NOT NULL DEFAULT 10,
  max_uploads_per_event INTEGER,
  max_file_size_mb INTEGER NOT NULL DEFAULT 16,
  allowed_mime_types JSONB NOT NULL DEFAULT '["image/jpeg", "image/png", "image/webp"]',
  photo_retention_days INTEGER,
  download_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------
-- Tabel photos
-- -------------------------------------------
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
  width INTEGER NOT NULL CHECK (width > 0),
  height INTEGER NOT NULL CHECK (height > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected', 'hidden', 'deleted')),
  guest_session_id TEXT,
  filter_key TEXT,
  frame_id UUID,
  captured_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_photos_event_id_status_uploaded_at ON photos(event_id, status, uploaded_at DESC);
CREATE INDEX idx_photos_event_id_created_at ON photos(event_id, created_at DESC);

-- -------------------------------------------
-- Helper: updated_at trigger
-- -------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_settings_updated_at
  BEFORE UPDATE ON event_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
