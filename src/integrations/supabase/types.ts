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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      cleaning_documentations: {
        Row: {
          cleaning_id: string
          created_at: string
          id: string
          image_url: string
          notes: string | null
          uploaded_by: string | null
        }
        Insert: {
          cleaning_id: string
          created_at?: string
          id?: string
          image_url: string
          notes?: string | null
          uploaded_by?: string | null
        }
        Update: {
          cleaning_id?: string
          created_at?: string
          id?: string
          image_url?: string
          notes?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cleaning_documentations_cleaning_id_fkey"
            columns: ["cleaning_id"]
            isOneToOne: false
            referencedRelation: "cleaning_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaning_schedules: {
        Row: {
          cleaning_date: string
          cleaning_time: string
          created_at: string
          helper_id: string | null
          id: string
          notes: string | null
          property_id: string
          status: Database["public"]["Enums"]["cleaning_status"]
        }
        Insert: {
          cleaning_date: string
          cleaning_time?: string
          created_at?: string
          helper_id?: string | null
          id?: string
          notes?: string | null
          property_id: string
          status?: Database["public"]["Enums"]["cleaning_status"]
        }
        Update: {
          cleaning_date?: string
          cleaning_time?: string
          created_at?: string
          helper_id?: string | null
          id?: string
          notes?: string | null
          property_id?: string
          status?: Database["public"]["Enums"]["cleaning_status"]
        }
        Relationships: [
          {
            foreignKeyName: "cleaning_schedules_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      contents: {
        Row: {
          created_at: string
          id: string
          like_count: number
          platform: Database["public"]["Enums"]["social_platform"]
          posted_at: string
          property_id: string | null
          title: string
          url: string | null
          viewer_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          like_count?: number
          platform: Database["public"]["Enums"]["social_platform"]
          posted_at?: string
          property_id?: string | null
          title: string
          url?: string | null
          viewer_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          like_count?: number
          platform?: Database["public"]["Enums"]["social_platform"]
          posted_at?: string
          property_id?: string | null
          title?: string
          url?: string | null
          viewer_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "contents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          assistant_id: string | null
          check_in_date: string | null
          check_in_done: boolean
          check_in_time: string | null
          created_at: string
          dp_amount: number
          dp_method: string | null
          dp_paid_at: string | null
          dp_status: Database["public"]["Enums"]["payment_state"]
          id: string
          monthly_price: number
          notes: string | null
          property_id: string | null
          prospect_id: string
          room_id: string | null
          settlement_amount: number
          settlement_method: string | null
          settlement_paid_at: string | null
          settlement_status: Database["public"]["Enums"]["payment_state"]
        }
        Insert: {
          assistant_id?: string | null
          check_in_date?: string | null
          check_in_done?: boolean
          check_in_time?: string | null
          created_at?: string
          dp_amount?: number
          dp_method?: string | null
          dp_paid_at?: string | null
          dp_status?: Database["public"]["Enums"]["payment_state"]
          id?: string
          monthly_price?: number
          notes?: string | null
          property_id?: string | null
          prospect_id: string
          room_id?: string | null
          settlement_amount?: number
          settlement_method?: string | null
          settlement_paid_at?: string | null
          settlement_status?: Database["public"]["Enums"]["payment_state"]
        }
        Update: {
          assistant_id?: string | null
          check_in_date?: string | null
          check_in_done?: boolean
          check_in_time?: string | null
          created_at?: string
          dp_amount?: number
          dp_method?: string | null
          dp_paid_at?: string | null
          dp_status?: Database["public"]["Enums"]["payment_state"]
          id?: string
          monthly_price?: number
          notes?: string | null
          property_id?: string | null
          prospect_id?: string
          room_id?: string | null
          settlement_amount?: number
          settlement_method?: string | null
          settlement_paid_at?: string | null
          settlement_status?: Database["public"]["Enums"]["payment_state"]
        }
        Relationships: [
          {
            foreignKeyName: "deals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          billing_month: string
          created_at: string
          due_date: string
          id: string
          invoice_number: string
          paid_at: string | null
          property_id: string | null
          room_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          tenant_id: string
        }
        Insert: {
          amount?: number
          billing_month: string
          created_at?: string
          due_date: string
          id?: string
          invoice_number: string
          paid_at?: string | null
          property_id?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          tenant_id: string
        }
        Update: {
          amount?: number
          billing_month?: string
          created_at?: string
          due_date?: string
          id?: string
          invoice_number?: string
          paid_at?: string | null
          property_id?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_reports: {
        Row: {
          created_at: string
          id: string
          maintenance_notes: string | null
          month: number
          property_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          maintenance_notes?: string | null
          month: number
          property_id: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          maintenance_notes?: string | null
          month?: number
          property_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_reports_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          reference_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          paid_at: string
          payment_method: string | null
          tenant_id: string
          verified_by: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id: string
          notes?: string | null
          paid_at?: string
          payment_method?: string | null
          tenant_id: string
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          paid_at?: string
          payment_method?: string | null
          tenant_id?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          city: string | null
          created_at: string
          description: string | null
          facilities: string[]
          id: string
          image_url: string | null
          name: string
          owner_id: string | null
          status: Database["public"]["Enums"]["property_status"]
          whatsapp_number: string | null
        }
        Insert: {
          address?: string
          city?: string | null
          created_at?: string
          description?: string | null
          facilities?: string[]
          id?: string
          image_url?: string | null
          name: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          whatsapp_number?: string | null
        }
        Update: {
          address?: string
          city?: string | null
          created_at?: string
          description?: string | null
          facilities?: string[]
          id?: string
          image_url?: string | null
          name?: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["property_status"]
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      prospects: {
        Row: {
          created_at: string
          created_by: string | null
          first_contact_date: string
          full_name: string
          id: string
          institution: string | null
          notes: string | null
          phone: string
          property_id: string | null
          room_id: string | null
          status: Database["public"]["Enums"]["prospect_status"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          first_contact_date?: string
          full_name: string
          id?: string
          institution?: string | null
          notes?: string | null
          phone: string
          property_id?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["prospect_status"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          first_contact_date?: string
          full_name?: string
          id?: string
          institution?: string | null
          notes?: string | null
          phone?: string
          property_id?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["prospect_status"]
        }
        Relationships: [
          {
            foreignKeyName: "prospects_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospects_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          description: string | null
          facilities: string[]
          id: string
          image_url: string | null
          price: number
          property_id: string
          room_number: string
          status: Database["public"]["Enums"]["room_status"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          facilities?: string[]
          id?: string
          image_url?: string | null
          price?: number
          property_id: string
          room_number: string
          status?: Database["public"]["Enums"]["room_status"]
        }
        Update: {
          created_at?: string
          description?: string | null
          facilities?: string[]
          id?: string
          image_url?: string | null
          price?: number
          property_id?: string
          room_number?: string
          status?: Database["public"]["Enums"]["room_status"]
        }
        Relationships: [
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          check_in_date: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          institution: string | null
          monthly_price: number
          phone: string | null
          property_id: string | null
          room_id: string | null
          status: Database["public"]["Enums"]["tenant_status"]
          user_id: string | null
        }
        Insert: {
          check_in_date?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          institution?: string | null
          monthly_price?: number
          phone?: string | null
          property_id?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          user_id?: string | null
        }
        Update: {
          check_in_date?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          institution?: string | null
          monthly_price?: number
          phone?: string | null
          property_id?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
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
      visit_documentations: {
        Row: {
          created_at: string
          id: string
          image_url: string
          notes: string | null
          uploaded_by: string | null
          visit_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          notes?: string | null
          uploaded_by?: string | null
          visit_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          notes?: string | null
          uploaded_by?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_documentations_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          assistant_id: string | null
          created_at: string
          id: string
          notes: string | null
          property_id: string | null
          prospect_id: string
          room_id: string | null
          status: Database["public"]["Enums"]["visit_status"]
          visit_date: string
          visit_time: string
        }
        Insert: {
          assistant_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          property_id?: string | null
          prospect_id: string
          room_id?: string | null
          status?: Database["public"]["Enums"]["visit_status"]
          visit_date: string
          visit_time?: string
        }
        Update: {
          assistant_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          property_id?: string | null
          prospect_id?: string
          room_id?: string | null
          status?: Database["public"]["Enums"]["visit_status"]
          visit_date?: string
          visit_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_read_cleaning: { Args: { _cleaning_id: string }; Returns: boolean }
      generate_monthly_invoices: { Args: { _month: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_assistant_of_prospect: {
        Args: { _prospect_id: string }
        Returns: boolean
      }
      is_my_cleaning: { Args: { _cleaning_id: string }; Returns: boolean }
      is_my_tenancy_property: {
        Args: { _property_id: string }
        Returns: boolean
      }
      is_my_tenant_row: { Args: { _tenant_id: string }; Returns: boolean }
      is_my_visit: { Args: { _visit_id: string }; Returns: boolean }
      notify_admins: {
        Args: { _message: string; _ref: string; _title: string; _type: string }
        Returns: undefined
      }
      notify_user: {
        Args: {
          _message: string
          _ref: string
          _title: string
          _type: string
          _user_id: string
        }
        Returns: undefined
      }
      owns_property: { Args: { _property_id: string }; Returns: boolean }
      owns_tenant_property: { Args: { _tenant_id: string }; Returns: boolean }
      owns_visit_property: { Args: { _visit_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "owner" | "assistant" | "helper" | "tenant"
      cleaning_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      invoice_status: "unpaid" | "paid" | "overdue"
      payment_state: "unpaid" | "paid"
      property_status: "active" | "inactive"
      prospect_status:
        | "new_lead"
        | "contacted"
        | "visit_scheduled"
        | "visited"
        | "follow_up"
        | "deal"
        | "not_deal"
      room_status: "available" | "occupied" | "maintenance"
      social_platform: "instagram" | "tiktok" | "facebook"
      tenant_status: "active" | "inactive"
      visit_status: "scheduled" | "completed" | "cancelled"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "owner", "assistant", "helper", "tenant"],
      cleaning_status: ["scheduled", "in_progress", "completed", "cancelled"],
      invoice_status: ["unpaid", "paid", "overdue"],
      payment_state: ["unpaid", "paid"],
      property_status: ["active", "inactive"],
      prospect_status: [
        "new_lead",
        "contacted",
        "visit_scheduled",
        "visited",
        "follow_up",
        "deal",
        "not_deal",
      ],
      room_status: ["available", "occupied", "maintenance"],
      social_platform: ["instagram", "tiktok", "facebook"],
      tenant_status: ["active", "inactive"],
      visit_status: ["scheduled", "completed", "cancelled"],
    },
  },
} as const
