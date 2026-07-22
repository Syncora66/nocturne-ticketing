export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          owner_id: string;
          logo_url: string | null;
          primary_color: string | null;
          commission_rate: number;
          stripe_account_id: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["organizations"]["Row"]> & {
          name: string;
          slug: string;
          owner_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Row"]>;
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["organization_members"]["Row"]
        > & {
          organization_id: string;
          user_id: string;
          role: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["organization_members"]["Row"]
        >;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          event_date: string;
          doors_open: string | null;
          doors_close: string | null;
          location_name: string | null;
          location_address: string | null;
          max_capacity: number | null;
          status: string;
          base_price_cents: number | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["events"]["Row"]> & {
          organization_id: string;
          title: string;
          slug: string;
          event_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Row"]>;
        Relationships: [];
      };
      ticket_types: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          description: string | null;
          price_cents: number;
          total_quantity: number;
          remaining_quantity: number;
          sales_start: string | null;
          sales_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["ticket_types"]["Row"]> & {
          event_id: string;
          name: string;
          price_cents: number;
          total_quantity: number;
          remaining_quantity: number;
        };
        Update: Partial<Database["public"]["Tables"]["ticket_types"]["Row"]>;
        Relationships: [];
      };
      tickets: {
        Row: {
          id: string;
          ticket_type_id: string;
          event_id: string;
          buyer_id: string | null;
          buyer_email: string;
          buyer_name: string | null;
          qr_code: string;
          status: string;
          scanned_at: string | null;
          scanned_by_id: string | null;
          price_cents: number;
          commission_cents: number | null;
          net_cents: number | null;
          refund_requested_at: string | null;
          refund_reason: string | null;
          refund_status: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["tickets"]["Row"]> & {
          ticket_type_id: string;
          event_id: string;
          buyer_email: string;
          qr_code: string;
          price_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["tickets"]["Row"]>;
        Relationships: [];
      };
      support_tickets: {
        Row: {
          id: string;
          organization_id: string;
          event_id: string | null;
          ticket_id: string | null;
          customer_email: string;
          customer_name: string;
          subject: string;
          description: string;
          category: string;
          status: string;
          priority: "low" | "normal" | "high" | "urgent";
          ai_handled: boolean;
          ai_solution: string | null;
          escalated_to_human: boolean;
          assigned_to_id: string | null;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["support_tickets"]["Row"]> & {
          organization_id: string;
          customer_email: string;
          customer_name: string;
          subject: string;
          description: string;
          category: string;
        };
        Update: Partial<Database["public"]["Tables"]["support_tickets"]["Row"]>;
        Relationships: [];
      };
      support_conversations: {
        Row: {
          id: string;
          support_ticket_id: string;
          message: string;
          sender_type: "customer" | "human" | "ai";
          sender_id: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["support_conversations"]["Row"]
        > & {
          support_ticket_id: string;
          message: string;
          sender_type: "customer" | "human" | "ai";
        };
        Update: Partial<
          Database["public"]["Tables"]["support_conversations"]["Row"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      purchase_tickets: {
        Args: {
          p_ticket_type_id: string;
          p_quantity: number;
        };
        Returns: Database["public"]["Tables"]["ticket_types"]["Row"][];
      };
      release_tickets: {
        Args: {
          p_ticket_type_id: string;
          p_quantity: number;
        };
        Returns: Database["public"]["Tables"]["ticket_types"]["Row"][];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
