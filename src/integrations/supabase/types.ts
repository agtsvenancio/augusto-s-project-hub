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
      clients: {
        Row: {
          contact_name: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          is_demo: boolean
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          is_demo?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          is_demo?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      maintenance: {
        Row: {
          amount: number
          client_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          financial_status: Database["public"]["Enums"]["financial_status"]
          id: string
          is_demo: boolean
          notes: string | null
          project_id: string | null
          requested_at: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["maintenance_status"]
          title: string
          type: Database["public"]["Enums"]["maintenance_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          financial_status?: Database["public"]["Enums"]["financial_status"]
          id?: string
          is_demo?: boolean
          notes?: string | null
          project_id?: string | null
          requested_at?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          title: string
          type?: Database["public"]["Enums"]["maintenance_type"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          financial_status?: Database["public"]["Enums"]["financial_status"]
          id?: string
          is_demo?: boolean
          notes?: string | null
          project_id?: string | null
          requested_at?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          title?: string
          type?: Database["public"]["Enums"]["maintenance_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          is_demo: boolean
          maintenance_id: string | null
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          paid_at: string
          project_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          is_demo?: boolean
          maintenance_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_at?: string
          project_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          is_demo?: boolean
          maintenance_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_at?: string
          project_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "maintenance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_history: {
        Row: {
          created_at: string
          detail: string | null
          event: string
          id: string
          maintenance_id: string | null
          project_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          event: string
          id?: string
          maintenance_id?: string | null
          project_id?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          event?: string
          id?: string
          maintenance_id?: string | null
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_history_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "maintenance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          amount: number
          client_id: string | null
          contracted_at: string | null
          created_at: string
          delivered_at: string | null
          description: string | null
          domain: string | null
          due_date: string | null
          financial_status: Database["public"]["Enums"]["financial_status"]
          hosting: string | null
          id: string
          is_demo: boolean
          name: string
          notes: string | null
          preview_url: string | null
          production_status: Database["public"]["Enums"]["production_status"]
          production_url: string | null
          repository_url: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["project_status"]
          type: Database["public"]["Enums"]["project_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          client_id?: string | null
          contracted_at?: string | null
          created_at?: string
          delivered_at?: string | null
          description?: string | null
          domain?: string | null
          due_date?: string | null
          financial_status?: Database["public"]["Enums"]["financial_status"]
          hosting?: string | null
          id?: string
          is_demo?: boolean
          name: string
          notes?: string | null
          preview_url?: string | null
          production_status?: Database["public"]["Enums"]["production_status"]
          production_url?: string | null
          repository_url?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          type?: Database["public"]["Enums"]["project_type"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          contracted_at?: string | null
          created_at?: string
          delivered_at?: string | null
          description?: string | null
          domain?: string | null
          due_date?: string | null
          financial_status?: Database["public"]["Enums"]["financial_status"]
          hosting?: string | null
          id?: string
          is_demo?: boolean
          name?: string
          notes?: string | null
          preview_url?: string | null
          production_status?: Database["public"]["Enums"]["production_status"]
          production_url?: string | null
          repository_url?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          type?: Database["public"]["Enums"]["project_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          category: string | null
          created_at: string
          default_price: number
          description: string | null
          id: string
          is_demo: boolean
          name: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          created_at?: string
          default_price?: number
          description?: string | null
          id?: string
          is_demo?: boolean
          name: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          created_at?: string
          default_price?: number
          description?: string | null
          id?: string
          is_demo?: boolean
          name?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clear_demo_data: { Args: never; Returns: undefined }
      seed_demo_data: { Args: never; Returns: undefined }
    }
    Enums: {
      financial_status:
        | "nao_faturado"
        | "aguardando_pagamento"
        | "parcialmente_pago"
        | "pago"
        | "atrasado"
      maintenance_status:
        | "solicitada"
        | "aguardando_informacoes"
        | "em_andamento"
        | "aguardando_aprovacao"
        | "concluida"
        | "cancelada"
      maintenance_type:
        | "correcao_bug"
        | "alteracao_conteudo"
        | "alteracao_visual"
        | "alteracao_layout"
        | "integracao"
        | "configuracao_dominio"
        | "hospedagem"
        | "seo_tecnico"
        | "performance"
        | "atualizacao"
        | "outro"
      payment_method:
        | "pix"
        | "transferencia"
        | "dinheiro"
        | "cartao"
        | "boleto"
        | "outro"
      production_status:
        | "nao_iniciado"
        | "desenvolvimento"
        | "preview"
        | "em_producao"
      project_status:
        | "orcamento"
        | "aguardando_aprovacao"
        | "aguardando_informacoes"
        | "em_desenvolvimento"
        | "em_revisao"
        | "ajustes"
        | "pronto"
        | "publicado"
        | "concluido"
        | "cancelado"
      project_type:
        | "landing_page"
        | "site_institucional"
        | "ecommerce"
        | "pagina_campanha"
        | "sistema_web"
        | "manutencao"
        | "outro"
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
      financial_status: [
        "nao_faturado",
        "aguardando_pagamento",
        "parcialmente_pago",
        "pago",
        "atrasado",
      ],
      maintenance_status: [
        "solicitada",
        "aguardando_informacoes",
        "em_andamento",
        "aguardando_aprovacao",
        "concluida",
        "cancelada",
      ],
      maintenance_type: [
        "correcao_bug",
        "alteracao_conteudo",
        "alteracao_visual",
        "alteracao_layout",
        "integracao",
        "configuracao_dominio",
        "hospedagem",
        "seo_tecnico",
        "performance",
        "atualizacao",
        "outro",
      ],
      payment_method: [
        "pix",
        "transferencia",
        "dinheiro",
        "cartao",
        "boleto",
        "outro",
      ],
      production_status: [
        "nao_iniciado",
        "desenvolvimento",
        "preview",
        "em_producao",
      ],
      project_status: [
        "orcamento",
        "aguardando_aprovacao",
        "aguardando_informacoes",
        "em_desenvolvimento",
        "em_revisao",
        "ajustes",
        "pronto",
        "publicado",
        "concluido",
        "cancelado",
      ],
      project_type: [
        "landing_page",
        "site_institucional",
        "ecommerce",
        "pagina_campanha",
        "sistema_web",
        "manutencao",
        "outro",
      ],
    },
  },
} as const
