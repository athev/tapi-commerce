
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vpogvgilorgkeulvnpbb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwb2d2Z2lsb3Jna2V1bHZucGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTY1MjAsImV4cCI6MjA2MzU5MjUyMH0.fnYnpeGNV_FDZTswcjTdoyfaSUc4Rkt_a9F7BdH2oFw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  seller_id: string;
  seller_name: string;
  file_url?: string;
  product_type?: string;
  in_stock?: number;
  purchases?: number;
  delivery_data?: any;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  status: 'pending' | 'paid' | 'cancelled';
  delivery_status?: 'pending' | 'processing' | 'shipped' | 'delivered';
  buyer_email?: string;
  buyer_data?: any;
  delivery_notes?: string;
  manual_payment_requested?: boolean;
  casso_transaction_id?: string;
  payment_verified_at?: string;
  bank_transaction_id?: string;
  bank_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'seller' | 'end-user';
  created_at: string;
}

export interface SellerApplication {
  id: string;
  user_id: string;
  business_name: string;
  business_description: string;
  phone: string;
  address?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}
