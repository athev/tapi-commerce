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
      casso_transactions: {
        Row: {
          account_number: string | null
          amount: number
          created_at: string
          description: string
          id: string
          matched_at: string | null
          order_id: string | null
          processed: boolean | null
          transaction_id: string
          when_occurred: string
        }
        Insert: {
          account_number?: string | null
          amount: number
          created_at?: string
          description: string
          id?: string
          matched_at?: string | null
          order_id?: string | null
          processed?: boolean | null
          transaction_id: string
          when_occurred: string
        }
        Update: {
          account_number?: string | null
          amount?: number
          created_at?: string
          description?: string
          id?: string
          matched_at?: string | null
          order_id?: string | null
          processed?: boolean | null
          transaction_id?: string
          when_occurred?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_casso_transactions_order_id"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          count: number | null
          created_at: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          count?: number | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          count?: number | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          buyer_id: string
          buyer_unread_count: number | null
          chat_type: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          order_id: string | null
          product_id: string | null
          seller_id: string
          seller_unread_count: number | null
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          buyer_unread_count?: number | null
          chat_type?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          order_id?: string | null
          product_id?: string | null
          seller_id: string
          seller_unread_count?: number | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          buyer_unread_count?: number | null
          chat_type?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          order_id?: string | null
          product_id?: string | null
          seller_id?: string
          seller_unread_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      license_keys: {
        Row: {
          assigned_to_order: string | null
          created_at: string | null
          id: string
          is_used: boolean | null
          license_key: string
          product_id: string | null
          used_at: string | null
        }
        Insert: {
          assigned_to_order?: string | null
          created_at?: string | null
          id?: string
          is_used?: boolean | null
          license_key: string
          product_id?: string | null
          used_at?: string | null
        }
        Update: {
          assigned_to_order?: string | null
          created_at?: string | null
          id?: string
          is_used?: boolean | null
          license_key?: string
          product_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "license_keys_assigned_to_order_fkey"
            columns: ["assigned_to_order"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_keys_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string | null
          id: string
          image_url: string | null
          is_read: boolean | null
          message_type: string | null
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          message_type?: string | null
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          message_type?: string | null
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_order_id: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_order_id?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_order_id?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_disputes: {
        Row: {
          created_at: string
          description: string
          id: string
          order_id: string
          reason: string
          resolution_notes: string | null
          resolved_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          order_id: string
          reason: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          order_id?: string
          reason?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          bank_amount: number | null
          bank_transaction_id: string | null
          buyer_data: Json | null
          buyer_email: string | null
          casso_transaction_id: string | null
          created_at: string
          delivery_notes: string | null
          delivery_status: string | null
          id: string
          manual_payment_requested: boolean | null
          payment_verified_at: string | null
          product_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bank_amount?: number | null
          bank_transaction_id?: string | null
          buyer_data?: Json | null
          buyer_email?: string | null
          casso_transaction_id?: string | null
          created_at?: string
          delivery_notes?: string | null
          delivery_status?: string | null
          id?: string
          manual_payment_requested?: boolean | null
          payment_verified_at?: string | null
          product_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bank_amount?: number | null
          bank_transaction_id?: string | null
          buyer_data?: Json | null
          buyer_email?: string | null
          casso_transaction_id?: string | null
          created_at?: string
          delivery_notes?: string | null
          delivery_status?: string | null
          id?: string
          manual_payment_requested?: boolean | null
          payment_verified_at?: string | null
          product_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          delivery_data: Json | null
          description: string | null
          file_url: string | null
          id: string
          image: string | null
          in_stock: number | null
          price: number
          product_type: string | null
          purchases: number | null
          seller_id: string
          seller_name: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          delivery_data?: Json | null
          description?: string | null
          file_url?: string | null
          id?: string
          image?: string | null
          in_stock?: number | null
          price: number
          product_type?: string | null
          purchases?: number | null
          seller_id: string
          seller_name: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          delivery_data?: Json | null
          description?: string | null
          file_url?: string | null
          id?: string
          image?: string | null
          in_stock?: number | null
          price?: number
          product_type?: string | null
          purchases?: number | null
          seller_id?: string
          seller_name?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      seller_applications: {
        Row: {
          address: string | null
          business_description: string
          business_name: string
          created_at: string
          id: string
          phone: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          business_description: string
          business_name: string
          created_at?: string
          id?: string
          phone: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          business_description?: string
          business_name?: string
          created_at?: string
          id?: string
          phone?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          category: string
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      unmatched_transactions: {
        Row: {
          account_number: string | null
          amount: number
          created_at: string
          description: string
          id: string
          reason: string | null
          transaction_id: string
          when_occurred: string
        }
        Insert: {
          account_number?: string | null
          amount: number
          created_at?: string
          description: string
          id?: string
          reason?: string | null
          transaction_id: string
          when_occurred: string
        }
        Update: {
          account_number?: string | null
          amount?: number
          created_at?: string
          description?: string
          id?: string
          reason?: string | null
          transaction_id?: string
          when_occurred?: string
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
      wallet_logs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          pi_amount: number
          release_date: string | null
          status: string
          type: string
          updated_at: string
          vnd_amount: number
          wallet_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          pi_amount: number
          release_date?: string | null
          status?: string
          type: string
          updated_at?: string
          vnd_amount: number
          wallet_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          pi_amount?: number
          release_date?: string | null
          status?: string
          type?: string
          updated_at?: string
          vnd_amount?: number
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_logs_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          available: number
          created_at: string
          id: string
          pending: number
          total_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available?: number
          created_at?: string
          id?: string
          pending?: number
          total_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available?: number
          created_at?: string
          id?: string
          pending?: number
          total_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          bank_account_name: string
          bank_account_number: string
          bank_name: string
          created_at: string
          id: string
          pi_amount: number
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          status: string
          updated_at: string
          user_id: string
          vnd_amount: number
          wallet_id: string
        }
        Insert: {
          bank_account_name: string
          bank_account_number: string
          bank_name: string
          created_at?: string
          id?: string
          pi_amount: number
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          user_id: string
          vnd_amount: number
          wallet_id: string
        }
        Update: {
          bank_account_name?: string
          bank_account_number?: string
          bank_name?: string
          created_at?: string
          id?: string
          pi_amount?: number
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          vnd_amount?: number
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_order_for_seller: {
        Args: { order_id: string; seller_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "seller" | "end-user" | "accountant"
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
      app_role: ["admin", "seller", "end-user", "accountant"],
    },
  },
} as const
