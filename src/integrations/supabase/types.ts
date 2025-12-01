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
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number | null
          updated_at: string | null
          user_id: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number | null
          updated_at?: string | null
          user_id: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number | null
          updated_at?: string | null
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
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
      favorites: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
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
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: string | null
          read_at: string | null
          related_order_id: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          related_order_id?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
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
          discount_amount: number | null
          id: string
          manual_payment_requested: boolean | null
          payment_verified_at: string | null
          product_id: string
          status: string
          updated_at: string
          user_id: string
          variant_id: string | null
          voucher_id: string | null
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
          discount_amount?: number | null
          id?: string
          manual_payment_requested?: boolean | null
          payment_verified_at?: string | null
          product_id: string
          status?: string
          updated_at?: string
          user_id: string
          variant_id?: string | null
          voucher_id?: string | null
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
          discount_amount?: number | null
          id?: string
          manual_payment_requested?: boolean | null
          payment_verified_at?: string | null
          product_id?: string
          status?: string
          updated_at?: string
          user_id?: string
          variant_id?: string | null
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_main: boolean | null
          product_id: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_main?: boolean | null
          product_id?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_main?: boolean | null
          product_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          tag: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          tag: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          badge: string | null
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          id: string
          in_stock: number | null
          is_active: boolean | null
          original_price: number | null
          price: number
          product_id: string
          sort_order: number | null
          updated_at: string | null
          variant_name: string
        }
        Insert: {
          badge?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          in_stock?: number | null
          is_active?: boolean | null
          original_price?: number | null
          price: number
          product_id: string
          sort_order?: number | null
          updated_at?: string | null
          variant_name: string
        }
        Update: {
          badge?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          in_stock?: number | null
          is_active?: boolean | null
          original_price?: number | null
          price?: number
          product_id?: string
          sort_order?: number | null
          updated_at?: string | null
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          average_rating: number | null
          category: string
          chat_initiated_count: number | null
          complaint_rate: number | null
          created_at: string
          delivery_data: Json | null
          description: string | null
          favorites_count: number | null
          file_url: string | null
          id: string
          image: string | null
          in_stock: number | null
          is_mall_product: boolean | null
          is_sponsored: boolean | null
          keywords: string[] | null
          last_score_calculated_at: string | null
          meta_description: string | null
          meta_title: string | null
          price: number
          product_type: string | null
          purchases: number | null
          purchases_last_30_days: number | null
          purchases_last_7_days: number | null
          quality_score: number | null
          review_count: number | null
          seller_id: string
          seller_name: string
          slug: string | null
          status: string | null
          title: string
          views: number | null
        }
        Insert: {
          average_rating?: number | null
          category: string
          chat_initiated_count?: number | null
          complaint_rate?: number | null
          created_at?: string
          delivery_data?: Json | null
          description?: string | null
          favorites_count?: number | null
          file_url?: string | null
          id?: string
          image?: string | null
          in_stock?: number | null
          is_mall_product?: boolean | null
          is_sponsored?: boolean | null
          keywords?: string[] | null
          last_score_calculated_at?: string | null
          meta_description?: string | null
          meta_title?: string | null
          price: number
          product_type?: string | null
          purchases?: number | null
          purchases_last_30_days?: number | null
          purchases_last_7_days?: number | null
          quality_score?: number | null
          review_count?: number | null
          seller_id: string
          seller_name: string
          slug?: string | null
          status?: string | null
          title: string
          views?: number | null
        }
        Update: {
          average_rating?: number | null
          category?: string
          chat_initiated_count?: number | null
          complaint_rate?: number | null
          created_at?: string
          delivery_data?: Json | null
          description?: string | null
          favorites_count?: number | null
          file_url?: string | null
          id?: string
          image?: string | null
          in_stock?: number | null
          is_mall_product?: boolean | null
          is_sponsored?: boolean | null
          keywords?: string[] | null
          last_score_calculated_at?: string | null
          meta_description?: string | null
          meta_title?: string | null
          price?: number
          product_type?: string | null
          purchases?: number | null
          purchases_last_30_days?: number | null
          purchases_last_7_days?: number | null
          quality_score?: number | null
          review_count?: number | null
          seller_id?: string
          seller_name?: string
          slug?: string | null
          status?: string | null
          title?: string
          views?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_online: boolean | null
          phone: string | null
          response_rate: number | null
          response_time: string | null
          role: string
          seller_rating: number | null
          shop_banner: string | null
          shop_description: string | null
          slug: string | null
          total_products: number | null
        }
        Insert: {
          address?: string | null
          avatar?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_online?: boolean | null
          phone?: string | null
          response_rate?: number | null
          response_time?: string | null
          role?: string
          seller_rating?: number | null
          shop_banner?: string | null
          shop_description?: string | null
          slug?: string | null
          total_products?: number | null
        }
        Update: {
          address?: string | null
          avatar?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_online?: boolean | null
          phone?: string | null
          response_rate?: number | null
          response_time?: string | null
          role?: string
          seller_rating?: number | null
          shop_banner?: string | null
          shop_description?: string | null
          slug?: string | null
          total_products?: number | null
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
      seller_policies: {
        Row: {
          created_at: string | null
          description: string
          icon: string
          id: string
          is_active: boolean | null
          seller_id: string
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          icon: string
          id?: string
          is_active?: boolean | null
          seller_id: string
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          seller_id?: string
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      seller_promotions: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          seller_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          seller_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          seller_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_tickets: {
        Row: {
          accepted_at: string | null
          buyer_id: string
          completed_at: string | null
          completion_notes: string | null
          conversation_id: string | null
          created_at: string | null
          description: string
          id: string
          order_id: string | null
          product_id: string
          quoted_at: string | null
          quoted_price: number | null
          request_data: Json | null
          seller_id: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          buyer_id: string
          completed_at?: string | null
          completion_notes?: string | null
          conversation_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          order_id?: string | null
          product_id: string
          quoted_at?: string | null
          quoted_price?: number | null
          request_data?: Json | null
          seller_id: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          buyer_id?: string
          completed_at?: string | null
          completion_notes?: string | null
          conversation_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          order_id?: string | null
          product_id?: string
          quoted_at?: string | null
          quoted_price?: number | null
          request_data?: Json | null
          seller_id?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_tickets_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tickets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      voucher_categories: {
        Row: {
          category_name: string
          created_at: string | null
          id: string
          voucher_id: string
        }
        Insert: {
          category_name: string
          created_at?: string | null
          id?: string
          voucher_id: string
        }
        Update: {
          category_name?: string
          created_at?: string | null
          id?: string
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voucher_categories_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      voucher_products: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          voucher_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          voucher_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voucher_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_products_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      vouchers: {
        Row: {
          applicable_to: string | null
          code: string
          created_at: string | null
          created_by: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_purchase_amount: number | null
          updated_at: string | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_to?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_to?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
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
      decrement_favorites_count: {
        Args: { product_id: string }
        Returns: undefined
      }
      generate_slug: { Args: { input_text: string }; Returns: string }
      get_order_for_seller: {
        Args: { order_id: string; seller_id: string }
        Returns: Json
      }
      get_unread_notification_count: {
        Args: { user_id_param: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_chat_initiated: {
        Args: { product_id: string }
        Returns: undefined
      }
      increment_favorites_count: {
        Args: { product_id: string }
        Returns: undefined
      }
      increment_product_views: {
        Args: { product_id: string }
        Returns: undefined
      }
      update_purchases_30d: { Args: never; Returns: undefined }
      update_purchases_7d: { Args: never; Returns: undefined }
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
