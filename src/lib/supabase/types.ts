/**
 * Database types — hand-authored to mirror supabase/migrations.
 *
 * Once you have the Supabase CLI wired up you can replace this file with the
 * generated output of:
 *   supabase gen types typescript --linked > src/lib/supabase/types.ts
 * The shape below is intentionally compatible with that generator.
 */

export type DeliveryType = "license" | "gated" | "prompts";
export type ProductStatus = "draft" | "published";
export type UserRole = "user" | "admin";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          title: string;
          short_desc: string;
          long_desc: string | null;
          category: string;
          price_usd: number;
          cover_image_url: string | null;
          delivery_type: DeliveryType;
          ls_variant_id: string | null;
          status: ProductStatus;
          featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          short_desc: string;
          long_desc?: string | null;
          category: string;
          price_usd: number;
          cover_image_url?: string | null;
          delivery_type?: DeliveryType;
          ls_variant_id?: string | null;
          status?: ProductStatus;
          featured?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          short_desc?: string;
          long_desc?: string | null;
          category?: string;
          price_usd?: number;
          cover_image_url?: string | null;
          delivery_type?: DeliveryType;
          ls_variant_id?: string | null;
          status?: ProductStatus;
          featured?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      product_files: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          file_name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          file_name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          storage_path?: string;
          file_name?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_files_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      course_lessons: {
        Row: {
          id: string;
          product_id: string;
          title: string;
          content_md: string | null;
          video_path: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          title: string;
          content_md?: string | null;
          video_path?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          title?: string;
          content_md?: string | null;
          video_path?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "course_lessons_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_prompts: {
        Row: {
          id: string;
          product_id: string;
          title: string;
          description: string | null;
          prompt_body: string;
          example_input: string | null;
          example_output: string | null;
          model: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          title: string;
          description?: string | null;
          prompt_body: string;
          example_input?: string | null;
          example_output?: string | null;
          model?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          title?: string;
          description?: string | null;
          prompt_body?: string;
          example_input?: string | null;
          example_output?: string | null;
          model?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_prompts_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          ls_order_id: string | null;
          total_usd: number;
          status: string;
          receipt_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          ls_order_id?: string | null;
          total_usd: number;
          status?: string;
          receipt_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string;
          ls_order_id?: string | null;
          total_usd?: number;
          status?: string;
          receipt_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          price_usd: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          price_usd: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          price_usd?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      entitlements: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          order_id: string | null;
          granted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          order_id?: string | null;
          granted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          order_id?: string | null;
          granted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "entitlements_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "entitlements_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      download_events: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          file_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          file_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          file_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "download_events_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "download_events_file_id_fkey";
            columns: ["file_id"];
            referencedRelation: "product_files";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

/** Convenience row aliases. */
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductFile = Database["public"]["Tables"]["product_files"]["Row"];
export type CourseLesson =
  Database["public"]["Tables"]["course_lessons"]["Row"];
export type ProductPrompt =
  Database["public"]["Tables"]["product_prompts"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Entitlement = Database["public"]["Tables"]["entitlements"]["Row"];
export type DownloadEvent =
  Database["public"]["Tables"]["download_events"]["Row"];
