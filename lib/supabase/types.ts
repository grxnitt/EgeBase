export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          article_slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      article_progress: {
        Row: {
          id: string;
          user_id: string;
          article_slug: string;
          status: "read" | "unread";
          read_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_slug: string;
          status?: "read" | "unread";
          read_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_slug?: string;
          status?: "read" | "unread";
          read_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

