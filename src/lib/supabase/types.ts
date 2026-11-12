export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          slug: string;
          description: string | null;
          venue_name: string | null;
          starts_at: string | null;
          ends_at: string | null;
          timezone: string;
          status: string;
          visibility: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          slug: string;
          description?: string | null;
          venue_name?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          timezone?: string;
          status?: string;
          visibility?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          venue_name?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          timezone?: string;
          status?: string;
          visibility?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_settings: {
        Row: {
          event_id: string;
          allow_upload: boolean;
          allow_gallery: boolean;
          moderation_mode: string;
          max_photos_per_session: number;
          max_uploads_per_event: number | null;
          max_file_size_mb: number;
          allowed_mime_types: string[];
          photo_retention_days: number | null;
          download_enabled: boolean;
          updated_at: string;
        };
        Insert: {
          event_id: string;
          allow_upload?: boolean;
          allow_gallery?: boolean;
          moderation_mode?: string;
          max_photos_per_session?: number;
          max_uploads_per_event?: number | null;
          max_file_size_mb?: number;
          allowed_mime_types?: string[];
          photo_retention_days?: number | null;
          download_enabled?: boolean;
          updated_at?: string;
        };
        Update: {
          event_id?: string;
          allow_upload?: boolean;
          allow_gallery?: boolean;
          moderation_mode?: string;
          max_photos_per_session?: number;
          max_uploads_per_event?: number | null;
          max_file_size_mb?: number;
          allowed_mime_types?: string[];
          photo_retention_days?: number | null;
          download_enabled?: boolean;
          updated_at?: string;
        };
      };
      event_frames: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          asset_path: string;
          preview_path: string | null;
          config: Record<string, any>;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          asset_path: string;
          preview_path?: string | null;
          config?: Record<string, any>;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          asset_path?: string;
          preview_path?: string | null;
          config?: Record<string, any>;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      event_filters: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          filter_key: string;
          config: Record<string, any>;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          filter_key: string;
          config?: Record<string, any>;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          filter_key?: string;
          config?: Record<string, any>;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      photos: {
        Row: {
          id: string;
          event_id: string;
          storage_path: string;
          thumbnail_path: string | null;
          mime_type: string;
          file_size_bytes: number;
          width: number;
          height: number;
          status: string;
          guest_session_id: string | null;
          filter_key: string | null;
          frame_id: string | null;
          captured_at: string | null;
          uploaded_at: string;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          storage_path: string;
          thumbnail_path?: string | null;
          mime_type: string;
          file_size_bytes: number;
          width: number;
          height: number;
          status?: string;
          guest_session_id?: string | null;
          filter_key?: string | null;
          frame_id?: string | null;
          captured_at?: string | null;
          uploaded_at?: string;
          published_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          storage_path?: string;
          thumbnail_path?: string | null;
          mime_type?: string;
          file_size_bytes?: number;
          width?: number;
          height?: number;
          status?: string;
          guest_session_id?: string | null;
          filter_key?: string | null;
          frame_id?: string | null;
          captured_at?: string | null;
          uploaded_at?: string;
          published_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
