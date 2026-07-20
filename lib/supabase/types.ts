export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          workspace_name: string | null;
          avatar_url: string | null;
          subscription_tier: "free" | "pro" | "enterprise";
          stripe_customer_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          organizer_id: string;
          name: string;
          description: string | null;
          date: string;
          location: string | null;
          image_url: string | null;
          max_capacity: number | null;
          status: "draft" | "published" | "ended";
          language: "fr" | "en" | "es";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["events"]["Row"]> & {
          organizer_id: string;
          name: string;
          date: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Row"]>;
        Relationships: [];
      };
      ticket_tiers: {
        Row: {
          id: string;
          event_id: string;
          tier_name: string;
          price_cents: number;
          max_quantity: number | null;
          sold_quantity: number;
          presale_start: string | null;
          presale_end: string | null;
          tier_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["ticket_tiers"]["Row"]> & {
          event_id: string;
          tier_name: string;
          price_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["ticket_tiers"]["Row"]>;
        Relationships: [];
      };
      tickets_sold: {
        Row: {
          id: string;
          tier_id: string;
          event_id: string;
          buyer_email: string;
          buyer_name: string | null;
          qr_code: string;
          status: "valid" | "scanned" | "refunded" | "cancelled";
          amount_cents: number;
          payment_intent_id: string | null;
          purchased_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tickets_sold"]["Row"]> & {
          tier_id: string;
          event_id: string;
          buyer_email: string;
          qr_code: string;
          amount_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["tickets_sold"]["Row"]>;
        Relationships: [];
      };
      check_ins: {
        Row: {
          id: string;
          ticket_id: string;
          staff_id: string | null;
          qr_version: number;
          checked_in_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["check_ins"]["Row"]> & {
          ticket_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["check_ins"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
