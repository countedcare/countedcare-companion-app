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
      api_rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          identifier: string
          request_count: number | null
          updated_at: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          identifier: string
          request_count?: number | null
          updated_at?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number | null
          updated_at?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      care_recipients: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          id: string
          name: string
          notes: string | null
          relationship: string
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
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      encrypted_plaid_tokens: {
        Row: {
          created_at: string
          encrypted_access_token: string
          id: string
          linked_account_id: string
          nonce: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_access_token: string
          id?: string
          linked_account_id: string
          nonce: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_access_token?: string
          id?: string
          linked_account_id?: string
          nonce?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "encrypted_plaid_tokens_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: true
            referencedRelation: "linked_accounts"
            referencedColumns: ["id"]
          },
        ]
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
          avatar_url: string | null
          bio: string | null
          caregiving_for: string[] | null
          created_at: string | null
          email: string | null
          full_name: string | null
          household_agi: number | null
          id: string
          is_caregiver: boolean | null
          location: string | null
          name: string | null
          onboarding_complete: boolean | null
          updated_at: string | null
          username: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          caregiving_for?: string[] | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          household_agi?: number | null
          id: string
          is_caregiver?: boolean | null
          location?: string | null
          name?: string | null
          onboarding_complete?: boolean | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          caregiving_for?: string[] | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          household_agi?: number | null
          id?: string
          is_caregiver?: boolean | null
          location?: string | null
          name?: string | null
          onboarding_complete?: boolean | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      resource_bookmarks: {
        Row: {
          created_at: string | null
          resource_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          resource_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_bookmarks_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_events: {
        Row: {
          context: Json | null
          created_at: string | null
          event_type: string
          id: number
          resource_id: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          event_type: string
          id?: number
          resource_id?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          event_type?: string
          id?: number
          resource_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_events_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_suggestions: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          note: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          note?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          note?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          application_steps: string | null
          apply_url: string | null
          category: Database["public"]["Enums"]["resource_category"]
          contact_email: string | null
          contact_hours: string | null
          contact_phone: string | null
          county_name: string | null
          created_at: string | null
          description: string
          documents_required: string[] | null
          eligibility_summary: string | null
          estimated_benefit_max: number | null
          estimated_benefit_min: number | null
          id: string
          is_active: boolean | null
          search_tsv: unknown
          source_url: string | null
          state_code: string | null
          tags: string[] | null
          title: string
          university_ids: string[] | null
          updated_at: string | null
        }
        Insert: {
          application_steps?: string | null
          apply_url?: string | null
          category: Database["public"]["Enums"]["resource_category"]
          contact_email?: string | null
          contact_hours?: string | null
          contact_phone?: string | null
          county_name?: string | null
          created_at?: string | null
          description: string
          documents_required?: string[] | null
          eligibility_summary?: string | null
          estimated_benefit_max?: number | null
          estimated_benefit_min?: number | null
          id?: string
          is_active?: boolean | null
          search_tsv?: unknown
          source_url?: string | null
          state_code?: string | null
          tags?: string[] | null
          title: string
          university_ids?: string[] | null
          updated_at?: string | null
        }
        Update: {
          application_steps?: string | null
          apply_url?: string | null
          category?: Database["public"]["Enums"]["resource_category"]
          contact_email?: string | null
          contact_hours?: string | null
          contact_phone?: string | null
          county_name?: string | null
          created_at?: string | null
          description?: string
          documents_required?: string[] | null
          eligibility_summary?: string | null
          estimated_benefit_max?: number | null
          estimated_benefit_min?: number | null
          id?: string
          is_active?: boolean | null
          search_tsv?: unknown
          source_url?: string | null
          state_code?: string | null
          tags?: string[] | null
          title?: string
          university_ids?: string[] | null
          updated_at?: string | null
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
      universities: {
        Row: {
          county: string | null
          created_at: string | null
          id: string
          name: string
          state_code: string | null
        }
        Insert: {
          county?: string | null
          created_at?: string | null
          id: string
          name: string
          state_code?: string | null
        }
        Update: {
          county?: string | null
          created_at?: string | null
          id?: string
          name?: string
          state_code?: string | null
        }
        Relationships: []
      }
      user_beta_access: {
        Row: {
          checked_at: string
          created_at: string
          free_trial_expenses: number | null
          free_trial_limit: number | null
          has_access: boolean
          is_paid: boolean | null
          payment_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          checked_at?: string
          created_at?: string
          free_trial_expenses?: number | null
          free_trial_limit?: number | null
          has_access: boolean
          is_paid?: boolean | null
          payment_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          checked_at?: string
          created_at?: string
          free_trial_expenses?: number | null
          free_trial_limit?: number | null
          has_access?: boolean
          is_paid?: boolean | null
          payment_date?: string | null
          updated_at?: string
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_saved_resources: {
        Row: {
          created_at: string
          id: string
          resource_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          resource_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          resource_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          client_session_id: string
          device_id: string | null
          display_name: string | null
          email: string | null
          ended_at: string | null
          id: string
          ip: string | null
          last_seen: string
          started_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          client_session_id: string
          device_id?: string | null
          display_name?: string | null
          email?: string | null
          ended_at?: string | null
          id?: string
          ip?: string | null
          last_seen?: string
          started_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          client_session_id?: string
          device_id?: string | null
          display_name?: string | null
          email?: string | null
          ended_at?: string | null
          id?: string
          ip?: string | null
          last_seen?: string
          started_at?: string
          user_agent?: string | null
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
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_identifier: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
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
      get_decrypted_plaid_token: {
        Args: { p_account_id: string }
        Returns: string
      }
      get_online_user_count: { Args: never; Returns: number }
      get_online_users: {
        Args: never
        Returns: {
          display_name: string
          email: string
          last_seen: string
          user_id: string
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
      get_user_roles: {
        Args: { _user_id: string }
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_session_active: {
        Args: {
          session_row: Database["public"]["Tables"]["user_sessions"]["Row"]
        }
        Returns: boolean
      }
      migrate_plaid_tokens_to_encryption: {
        Args: never
        Returns: {
          error_details: string[]
          failed_count: number
          migrated_count: number
        }[]
      }
      search_resources: {
        Args: {
          p_category?: Database["public"]["Enums"]["resource_category"]
          p_county?: string
          p_state?: string
          p_tags?: string[]
          q: string
        }
        Returns: {
          category: Database["public"]["Enums"]["resource_category"]
          county_name: string
          description: string
          estimated_benefit_max: number
          estimated_benefit_min: number
          id: string
          rank: number
          state_code: string
          tags: string[]
          title: string
        }[]
      }
      store_encrypted_plaid_token: {
        Args: { p_account_id: string; p_token: string; p_user_id: string }
        Returns: string
      }
      update_triage_stats: {
        Args: { p_decision: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      resource_category: "federal" | "state" | "county" | "nonprofit"
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
      app_role: ["admin", "moderator", "user"],
      resource_category: ["federal", "state", "county", "nonprofit"],
    },
  },
} as const
