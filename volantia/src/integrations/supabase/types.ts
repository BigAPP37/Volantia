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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      custom_rates: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          rate: number
          rate_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          rate?: number
          rate_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          rate?: number
          rate_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      day_markers: {
        Row: {
          created_at: string
          date: string
          id: string
          marker_type: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          marker_type?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          marker_type?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      route_templates: {
        Row: {
          break_minutes: number
          created_at: string
          display_order: number
          end_time: string
          extra_hours: number
          full_diets_international: number
          full_diets_national: number
          half_diets_international: number
          half_diets_national: number
          half_night_hours: number
          id: string
          kilometers: number
          name: string
          night_hours: number
          overnights: number
          scope: string
          service_type: string
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          break_minutes?: number
          created_at?: string
          display_order?: number
          end_time: string
          extra_hours?: number
          full_diets_international?: number
          full_diets_national?: number
          half_diets_international?: number
          half_diets_national?: number
          half_night_hours?: number
          id?: string
          kilometers?: number
          name: string
          night_hours?: number
          overnights?: number
          scope?: string
          service_type?: string
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          break_minutes?: number
          created_at?: string
          display_order?: number
          end_time?: string
          extra_hours?: number
          full_diets_international?: number
          full_diets_national?: number
          half_diets_international?: number
          half_diets_national?: number
          half_night_hours?: number
          id?: string
          kilometers?: number
          name?: string
          night_hours?: number
          overnights?: number
          scope?: string
          service_type?: string
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          base_salary: number
          company_cif: string | null
          company_name: string | null
          created_at: string
          extra_hour_rate: number
          fixed_bonuses: number
          full_diet_international: number
          full_diet_national: number
          half_diet_international: number
          half_diet_national: number
          half_night_hour_rate: number
          id: string
          irpf: number
          kilometer_rate: number
          mei: number
          night_hour_rate: number
          overnight_international: number
          overnight_national: number
          show_diets: boolean
          show_extra_hours: boolean
          show_kilometers: boolean
          show_night_hours: boolean
          show_overnights: boolean
          show_tips: boolean
          social_security: number
          unemployment: number
          updated_at: string
          user_id: string
          weekend_multiplier: number
        }
        Insert: {
          base_salary?: number
          company_cif?: string | null
          company_name?: string | null
          created_at?: string
          extra_hour_rate?: number
          fixed_bonuses?: number
          full_diet_international?: number
          full_diet_national?: number
          half_diet_international?: number
          half_diet_national?: number
          half_night_hour_rate?: number
          id?: string
          irpf?: number
          kilometer_rate?: number
          mei?: number
          night_hour_rate?: number
          overnight_international?: number
          overnight_national?: number
          show_diets?: boolean
          show_extra_hours?: boolean
          show_kilometers?: boolean
          show_night_hours?: boolean
          show_overnights?: boolean
          show_tips?: boolean
          social_security?: number
          unemployment?: number
          updated_at?: string
          user_id: string
          weekend_multiplier?: number
        }
        Update: {
          base_salary?: number
          company_cif?: string | null
          company_name?: string | null
          created_at?: string
          extra_hour_rate?: number
          fixed_bonuses?: number
          full_diet_international?: number
          full_diet_national?: number
          half_diet_international?: number
          half_diet_national?: number
          half_night_hour_rate?: number
          id?: string
          irpf?: number
          kilometer_rate?: number
          mei?: number
          night_hour_rate?: number
          overnight_international?: number
          overnight_national?: number
          show_diets?: boolean
          show_extra_hours?: boolean
          show_kilometers?: boolean
          show_night_hours?: boolean
          show_overnights?: boolean
          show_tips?: boolean
          social_security?: number
          unemployment?: number
          updated_at?: string
          user_id?: string
          weekend_multiplier?: number
        }
        Relationships: []
      }
      work_entries: {
        Row: {
          break_minutes: number
          created_at: string
          date: string
          end_time: string
          extra_hours: number
          full_diets_international: number
          full_diets_national: number
          half_diets_international: number
          half_diets_national: number
          half_night_hours: number
          id: string
          kilometers: number
          night_hours: number
          notes: string | null
          overnights: number
          scope: string
          service_type: string
          start_time: string
          tips: number
          updated_at: string
          user_id: string
        }
        Insert: {
          break_minutes?: number
          created_at?: string
          date: string
          end_time: string
          extra_hours?: number
          full_diets_international?: number
          full_diets_national?: number
          half_diets_international?: number
          half_diets_national?: number
          half_night_hours?: number
          id?: string
          kilometers?: number
          night_hours?: number
          notes?: string | null
          overnights?: number
          scope?: string
          service_type?: string
          start_time: string
          tips?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          break_minutes?: number
          created_at?: string
          date?: string
          end_time?: string
          extra_hours?: number
          full_diets_international?: number
          full_diets_national?: number
          half_diets_international?: number
          half_diets_national?: number
          half_night_hours?: number
          id?: string
          kilometers?: number
          night_hours?: number
          notes?: string | null
          overnights?: number
          scope?: string
          service_type?: string
          start_time?: string
          tips?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      work_entry_custom_rates: {
        Row: {
          created_at: string
          custom_rate_id: string
          id: string
          quantity: number
          rate_snapshot: number
          work_entry_id: string
        }
        Insert: {
          created_at?: string
          custom_rate_id: string
          id?: string
          quantity?: number
          rate_snapshot: number
          work_entry_id: string
        }
        Update: {
          created_at?: string
          custom_rate_id?: string
          id?: string
          quantity?: number
          rate_snapshot?: number
          work_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_entry_custom_rates_custom_rate_id_fkey"
            columns: ["custom_rate_id"]
            isOneToOne: false
            referencedRelation: "custom_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_entry_custom_rates_work_entry_id_fkey"
            columns: ["work_entry_id"]
            isOneToOne: false
            referencedRelation: "work_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      work_entry_expenses: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          expense_type: string
          id: string
          is_company_paid: boolean
          ticket_image_url: string | null
          work_entry_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          expense_type?: string
          id?: string
          is_company_paid?: boolean
          ticket_image_url?: string | null
          work_entry_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          expense_type?: string
          id?: string
          is_company_paid?: boolean
          ticket_image_url?: string | null
          work_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_entry_expenses_work_entry_id_fkey"
            columns: ["work_entry_id"]
            isOneToOne: false
            referencedRelation: "work_entries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
