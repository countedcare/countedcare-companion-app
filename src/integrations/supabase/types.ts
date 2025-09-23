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
          category_guess: string | null
          category_raw: Json | null
          counterparty_id: string | null
          created_at: string | null
          currency: string | null
          date: string
          description: string | null
          expense_tags: string[] | null
          external_id: string | null
          id: string
          irs_description: string | null
          irs_reference_tag: string | null
          is_potentially_deductible: boolean | null
          is_refund: boolean | null
          is_reimbursed: boolean | null
          is_tax_deductible: boolean | null
          linked_account_id: string | null
          location: Json | null
          memo: string | null
          notes: string | null
          payment_channel: string | null
          receipt_required_at: string | null
          receipt_url: string | null
          receipt_urls: string[] | null
          reimbursement_source: string | null
          source: string | null
          status: string | null
          synced_transaction_id: string | null
          triage_status: string | null
          updated_at: string | null
          user_id: string
          vendor: string | null
        }
        Insert: {
          amount: number
          care_recipient_id?: string | null
          category: string
          category_guess?: string | null
          category_raw?: Json | null
          counterparty_id?: string | null
          created_at?: string | null
          currency?: string | null
          date: string
          description?: string | null
          expense_tags?: string[] | null
          external_id?: string | null
          id?: string
          irs_description?: string | null
          irs_reference_tag?: string | null
          is_potentially_deductible?: boolean | null
          is_refund?: boolean | null
          is_reimbursed?: boolean | null
          is_tax_deductible?: boolean | null
          linked_account_id?: string | null
          location?: Json | null
          memo?: string | null
          notes?: string | null
          payment_channel?: string | null
          receipt_required_at?: string | null
          receipt_url?: string | null
          receipt_urls?: string[] | null
          reimbursement_source?: string | null
          source?: string | null
          status?: string | null
          synced_transaction_id?: string | null
          triage_status?: string | null
          updated_at?: string | null
          user_id: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          care_recipient_id?: string | null
          category?: string
          category_guess?: string | null
          category_raw?: Json | null
          counterparty_id?: string | null
          created_at?: string | null
          currency?: string | null
          date?: string
          description?: string | null
          expense_tags?: string[] | null
          external_id?: string | null
          id?: string
          irs_description?: string | null
          irs_reference_tag?: string | null
          is_potentially_deductible?: boolean | null
          is_refund?: boolean | null
          is_reimbursed?: boolean | null
          is_tax_deductible?: boolean | null
          linked_account_id?: string | null
          location?: Json | null
          memo?: string | null
          notes?: string | null
          payment_channel?: string | null
          receipt_required_at?: string | null
          receipt_url?: string | null
          receipt_urls?: string[] | null
          reimbursement_source?: string | null
          source?: string | null
          status?: string | null
          synced_transaction_id?: string | null
          triage_status?: string | null
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
      gamification: {
        Row: {
          best_streak: number
          challenges_completed: number
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          level: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak?: number
          challenges_completed?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_streak?: number
          challenges_completed?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      resources: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_favorited: boolean
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_favorited?: boolean
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_favorited?: boolean
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
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
          matched_expense_id: string | null
          merchant_name: string | null
          reimbursement_source: string | null
          review_status: string | null
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
          matched_expense_id?: string | null
          merchant_name?: string | null
          reimbursement_source?: string | null
          review_status?: string | null
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
          matched_expense_id?: string | null
          merchant_name?: string | null
          reimbursement_source?: string | null
          review_status?: string | null
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
          {
            foreignKeyName: "synced_transactions_matched_expense_id_fkey"
            columns: ["matched_expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_triage: {
        Row: {
          created_at: string | null
          decision: string
          id: string
          transaction_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          decision: string
          id?: string
          transaction_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          decision?: string
          id?: string
          transaction_id?: string
          user_id?: string
        }
        Relationships: []
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
      user_preferences: {
        Row: {
          created_at: string
          id: string
          last_quick_action: string | null
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_quick_action?: string | null
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_quick_action?: string | null
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_triage_stats: {
        Row: {
          created_at: string | null
          id: string
          last_reset_date: string | null
          reviewed_today: number | null
          tips_shown: number | null
          total_to_review: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_reset_date?: string | null
          reviewed_today?: number | null
          tips_shown?: number | null
          total_to_review?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_reset_date?: string | null
          reviewed_today?: number | null
          tips_shown?: number | null
          total_to_review?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_user_transactions: {
        Args: {
          p_filter?: string
          p_limit?: number
          p_offset?: number
          p_user_id: string
        }
        Returns: {
          account_id: string
          amount: number
          authorized_date: string
          category: string
          date: string
          expense_category: string
          expense_id: string
          is_confirmed_medical: boolean
          is_potential_medical: boolean
          iso_currency_code: string
          location: Json
          merchant_entity_id: string
          merchant_name: string
          name: string
          payment_channel: string
          pending: boolean
          personal_finance_category: Json
          subcategory: string
          transaction_id: string
          triage_created_at: string
          triage_decision: string
        }[]
      }
      get_pending_triage_transactions: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          account_id: string
          amount: number
          authorized_date: string
          category: string
          date: string
          iso_currency_code: string
          location: Json
          merchant_entity_id: string
          merchant_name: string
          name: string
          payment_channel: string
          pending: boolean
          personal_finance_category: Json
          subcategory: string
          transaction_id: string
        }[]
      }
      update_triage_stats: {
        Args: { p_decision: string; p_user_id: string }
        Returns: undefined
      }
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
