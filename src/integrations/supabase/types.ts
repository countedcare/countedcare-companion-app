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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      care_recipients: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          id: string
          name: string
          notes: string | null
          relationship: string
          ssn_last_four: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          name: string
          notes?: string | null
          relationship: string
          ssn_last_four?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          name?: string
          notes?: string | null
          relationship?: string
          ssn_last_four?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          care_recipient_id: string | null
          category: string
          created_at: string | null
          date: string
          description: string | null
          expense_tags: string[] | null
          id: string
          is_potentially_deductible: boolean | null
          is_reimbursed: boolean | null
          is_tax_deductible: boolean | null
          notes: string | null
          receipt_url: string | null
          reimbursement_source: string | null
          synced_transaction_id: string | null
          updated_at: string | null
          user_id: string
          vendor: string | null
        }
        Insert: {
          amount: number
          care_recipient_id?: string | null
          category: string
          created_at?: string | null
          date: string
          description?: string | null
          expense_tags?: string[] | null
          id?: string
          is_potentially_deductible?: boolean | null
          is_reimbursed?: boolean | null
          is_tax_deductible?: boolean | null
          notes?: string | null
          receipt_url?: string | null
          reimbursement_source?: string | null
          synced_transaction_id?: string | null
          updated_at?: string | null
          user_id: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          care_recipient_id?: string | null
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          expense_tags?: string[] | null
          id?: string
          is_potentially_deductible?: boolean | null
          is_reimbursed?: boolean | null
          is_tax_deductible?: boolean | null
          notes?: string | null
          receipt_url?: string | null
          reimbursement_source?: string | null
          synced_transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_care_recipient_id_fkey"
            columns: ["care_recipient_id"]
            isOneToOne: false
            referencedRelation: "care_recipients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_synced_transaction_id_fkey"
            columns: ["synced_transaction_id"]
            isOneToOne: false
            referencedRelation: "synced_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      linked_accounts: {
        Row: {
          account_name: string
          account_type: string
          created_at: string
          id: string
          institution_name: string | null
          is_active: boolean
          last_sync_at: string | null
          plaid_access_token: string | null
          plaid_account_id: string | null
          stripe_account_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_type: string
          created_at?: string
          id?: string
          institution_name?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          plaid_access_token?: string | null
          plaid_account_id?: string | null
          stripe_account_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_type?: string
          created_at?: string
          id?: string
          institution_name?: string | null
          is_active?: boolean
          last_sync_at?: string | null
          plaid_access_token?: string | null
          plaid_account_id?: string | null
          stripe_account_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          caregiving_for: string[] | null
          created_at: string | null
          email: string | null
          household_agi: number | null
          id: string
          is_caregiver: boolean | null
          name: string | null
          onboarding_complete: boolean | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          caregiving_for?: string[] | null
          created_at?: string | null
          email?: string | null
          household_agi?: number | null
          id: string
          is_caregiver?: boolean | null
          name?: string | null
          onboarding_complete?: boolean | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          caregiving_for?: string[] | null
          created_at?: string | null
          email?: string | null
          household_agi?: number | null
          id?: string
          is_caregiver?: boolean | null
          name?: string | null
          onboarding_complete?: boolean | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      synced_transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          date: string
          description: string
          expense_id: string | null
          id: string
          is_confirmed_medical: boolean | null
          is_potential_medical: boolean | null
          is_reimbursed: boolean | null
          is_tax_deductible: boolean | null
          linked_account_id: string | null
          merchant_name: string | null
          reimbursement_source: string | null
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          date: string
          description: string
          expense_id?: string | null
          id?: string
          is_confirmed_medical?: boolean | null
          is_potential_medical?: boolean | null
          is_reimbursed?: boolean | null
          is_tax_deductible?: boolean | null
          linked_account_id?: string | null
          merchant_name?: string | null
          reimbursement_source?: string | null
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          description?: string
          expense_id?: string | null
          id?: string
          is_confirmed_medical?: boolean | null
          is_potential_medical?: boolean | null
          is_reimbursed?: boolean | null
          is_tax_deductible?: boolean | null
          linked_account_id?: string | null
          merchant_name?: string | null
          reimbursement_source?: string | null
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "synced_transactions_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "synced_transactions_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "linked_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_documents: {
        Row: {
          content: string | null
          created_at: string | null
          document_type: string
          id: number
          is_shared: boolean | null
          sensitivity_level: number
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          document_type: string
          id?: never
          is_shared?: boolean | null
          sensitivity_level: number
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          document_type?: string
          id?: never
          is_shared?: boolean | null
          sensitivity_level?: number
          user_id?: string
        }
        Relationships: []
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
