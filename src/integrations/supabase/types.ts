export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          name: string
        }
        Insert: {
          count?: number | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          count?: number | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
