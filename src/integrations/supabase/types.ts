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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_history: {
        Row: {
          created_at: string
          id: string
          projects_referenced: string[] | null
          query: string
          response: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          projects_referenced?: string[] | null
          query: string
          response: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          projects_referenced?: string[] | null
          query?: string
          response?: string
          user_id?: string
        }
        Relationships: []
      }
      financials: {
        Row: {
          annual_operating_cost_usd: number | null
          annual_revenue_usd: number | null
          confidence_score: number
          data_source: string
          id: string
          irr_percent: number | null
          npv_usd: number | null
          payback_years: number | null
          project_id: string
          roi_percent: number | null
          source_url: string | null
          total_investment_usd: number
        }
        Insert: {
          annual_operating_cost_usd?: number | null
          annual_revenue_usd?: number | null
          confidence_score: number
          data_source: string
          id?: string
          irr_percent?: number | null
          npv_usd?: number | null
          payback_years?: number | null
          project_id: string
          roi_percent?: number | null
          source_url?: string | null
          total_investment_usd: number
        }
        Update: {
          annual_operating_cost_usd?: number | null
          annual_revenue_usd?: number | null
          confidence_score?: number
          data_source?: string
          id?: string
          irr_percent?: number | null
          npv_usd?: number | null
          payback_years?: number | null
          project_id?: string
          roi_percent?: number | null
          source_url?: string | null
          total_investment_usd?: number
        }
        Relationships: [
          {
            foreignKeyName: "financials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      outcomes: {
        Row: {
          co2_avoided_tons_year: number | null
          confidence_score: number
          energy_saved_kwh_year: number | null
          id: string
          jobs_created: number | null
          population_served: number | null
          project_id: string
          water_produced_m3_day: number | null
          water_saved_m3_year: number | null
        }
        Insert: {
          co2_avoided_tons_year?: number | null
          confidence_score: number
          energy_saved_kwh_year?: number | null
          id?: string
          jobs_created?: number | null
          population_served?: number | null
          project_id: string
          water_produced_m3_day?: number | null
          water_saved_m3_year?: number | null
        }
        Update: {
          co2_avoided_tons_year?: number | null
          confidence_score?: number
          energy_saved_kwh_year?: number | null
          id?: string
          jobs_created?: number | null
          population_served?: number | null
          project_id?: string
          water_produced_m3_day?: number | null
          water_saved_m3_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "outcomes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          queries_remaining: number
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          queries_remaining?: number
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          queries_remaining?: number
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
        }
        Relationships: []
      }
      projects: {
        Row: {
          capacity_unit: string | null
          capacity_value: number | null
          city: string | null
          completion_date: string | null
          country: string
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          project_stage: Database["public"]["Enums"]["project_stage"]
          region: string
          sector: Database["public"]["Enums"]["sector_type"]
          start_date: string | null
          technology_type: Database["public"]["Enums"]["technology_type"]
          updated_at: string
        }
        Insert: {
          capacity_unit?: string | null
          capacity_value?: number | null
          city?: string | null
          completion_date?: string | null
          country: string
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          project_stage?: Database["public"]["Enums"]["project_stage"]
          region: string
          sector: Database["public"]["Enums"]["sector_type"]
          start_date?: string | null
          technology_type: Database["public"]["Enums"]["technology_type"]
          updated_at?: string
        }
        Update: {
          capacity_unit?: string | null
          capacity_value?: number | null
          city?: string | null
          completion_date?: string | null
          country?: string
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          project_stage?: Database["public"]["Enums"]["project_stage"]
          region?: string
          sector?: Database["public"]["Enums"]["sector_type"]
          start_date?: string | null
          technology_type?: Database["public"]["Enums"]["technology_type"]
          updated_at?: string
        }
        Relationships: []
      }
      saved_projects: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      project_stage: "planning" | "construction" | "operational" | "completed"
      sector_type:
        | "municipal"
        | "industrial"
        | "agriculture"
        | "mining"
        | "energy"
        | "commercial"
      subscription_tier: "free" | "pro" | "enterprise"
      technology_type:
        | "desalination"
        | "reuse"
        | "leak_detection"
        | "smart_metering"
        | "nature_based"
        | "circular_systems"
        | "treatment"
        | "other"
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
      project_stage: ["planning", "construction", "operational", "completed"],
      sector_type: [
        "municipal",
        "industrial",
        "agriculture",
        "mining",
        "energy",
        "commercial",
      ],
      subscription_tier: ["free", "pro", "enterprise"],
      technology_type: [
        "desalination",
        "reuse",
        "leak_detection",
        "smart_metering",
        "nature_based",
        "circular_systems",
        "treatment",
        "other",
      ],
    },
  },
} as const
