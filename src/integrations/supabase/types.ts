export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          content_id: string | null
          created_at: string
          event_type: string
          id: number
          path: string
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          event_type: string
          id?: never
          path?: string
        }
        Update: {
          content_id?: string | null
          created_at?: string
          event_type?: string
          id?: never
          path?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: number
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      content_items: {
        Row: {
          author: string | null
          body_en: string
          body_sw: string
          category: string
          created_at: string
          created_by: string | null
          deadline: string | null
          document_url: string | null
          event_date: string | null
          external_id: string | null
          file_size: string | null
          gallery: string[]
          id: string
          image_url: string | null
          is_featured: boolean
          kind: string
          location: string | null
          organization: string | null
          project_status: string | null
          published_at: string | null
          slug: string
          source: string
          status: Database["public"]["Enums"]["content_status"]
          summary_en: string
          summary_sw: string
          tags: string[]
          title_en: string
          title_sw: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author?: string | null
          body_en?: string
          body_sw?: string
          category?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          document_url?: string | null
          event_date?: string | null
          external_id?: string | null
          file_size?: string | null
          gallery?: string[]
          id?: string
          image_url?: string | null
          is_featured?: boolean
          kind: string
          location?: string | null
          organization?: string | null
          project_status?: string | null
          published_at?: string | null
          slug: string
          source?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary_en?: string
          summary_sw?: string
          tags?: string[]
          title_en: string
          title_sw: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author?: string | null
          body_en?: string
          body_sw?: string
          category?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          document_url?: string | null
          event_date?: string | null
          external_id?: string | null
          file_size?: string | null
          gallery?: string[]
          id?: string
          image_url?: string | null
          is_featured?: boolean
          kind?: string
          location?: string | null
          organization?: string | null
          project_status?: string | null
          published_at?: string | null
          slug?: string
          source?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary_en?: string
          summary_sw?: string
          tags?: string[]
          title_en?: string
          title_sw?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      important_links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          sort_order: number
          title_en: string
          title_sw: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          title_en: string
          title_sw: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          title_en?: string
          title_sw?: string
          url?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          created_at: string
          created_by: string | null
          file_path: string
          id: string
          is_featured: boolean
          media_type: string
          mime_type: string | null
          name: string
          public_url: string
          size_bytes: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_path: string
          id?: string
          is_featured?: boolean
          media_type: string
          mime_type?: string | null
          name: string
          public_url: string
          size_bytes?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_path?: string
          id?: string
          is_featured?: boolean
          media_type?: string
          mime_type?: string | null
          name?: string
          public_url?: string
          size_bytes?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          job_title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          job_title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          job_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      public_submissions: {
        Row: {
          attachment_path: string | null
          consent: boolean
          created_at: string
          email: string | null
          full_name: string
          id: string
          institution: string | null
          internal_notes: string | null
          message: string
          phone: string | null
          reference_code: string
          status: Database["public"]["Enums"]["submission_status"]
          subject: string
          submission_type: string
          updated_at: string
        }
        Insert: {
          attachment_path?: string | null
          consent: boolean
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          institution?: string | null
          internal_notes?: string | null
          message: string
          phone?: string | null
          reference_code: string
          status?: Database["public"]["Enums"]["submission_status"]
          subject: string
          submission_type: string
          updated_at?: string
        }
        Update: {
          attachment_path?: string | null
          consent?: boolean
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          institution?: string | null
          internal_notes?: string | null
          message?: string
          phone?: string | null
          reference_code?: string
          status?: Database["public"]["Enums"]["submission_status"]
          subject?: string
          submission_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      slider_items: {
        Row: {
          caption_en: string
          caption_sw: string
          created_at: string
          duration_seconds: number
          id: string
          is_active: boolean
          link_url: string | null
          media_type: string
          media_url: string
          sort_order: number
          title_en: string
          title_sw: string
        }
        Insert: {
          caption_en?: string
          caption_sw?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          is_active?: boolean
          link_url?: string | null
          media_type?: string
          media_url: string
          sort_order?: number
          title_en?: string
          title_sw?: string
        }
        Update: {
          caption_en?: string
          caption_sw?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          is_active?: boolean
          link_url?: string | null
          media_type?: string
          media_url?: string
          sort_order?: number
          title_en?: string
          title_sw?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          platform: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          sort_order?: number
          url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor" | "reviewer"
      content_status: "draft" | "published" | "archived"
      submission_status: "new" | "in_review" | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "reviewer"],
      content_status: ["draft", "published", "archived"],
      submission_status: ["new", "in_review", "closed"],
    },
  },
} as const
