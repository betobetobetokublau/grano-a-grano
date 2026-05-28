/**
 * Tipos generados desde el schema de Supabase.
 *
 * Estos tipos reflejan la tabla `public.coffees` definida en
 * supabase/migrations/20260528000000_init_schema.sql.
 *
 * Para regenerar automaticamente cuando cambies el schema:
 *   1. Instala Docker Desktop (la CLI de Supabase lo necesita).
 *   2. Corre: npm run db:types
 *
 * Mientras Docker no este instalado, mantenlos sincronizados a mano cuando
 * agregues columnas o tablas. La tabla actual es pequena y estable, asi que
 * en la practica casi no se toca.
 */

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
      coffees: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          quantity_grams: number;
          roast_date: string | null;
          manual_expires_at: string | null;
          is_open: boolean;
          opened_at: string | null;
          origin: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          quantity_grams?: number;
          roast_date?: string | null;
          manual_expires_at?: string | null;
          is_open?: boolean;
          opened_at?: string | null;
          origin?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          quantity_grams?: number;
          roast_date?: string | null;
          manual_expires_at?: string | null;
          is_open?: boolean;
          opened_at?: string | null;
          origin?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coffees_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

/**
 * Helpers ergonomicos para componentes.
 * Uso: type Coffee = Tables<"coffees">
 */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
