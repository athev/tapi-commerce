
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export type UserProfile = {
  id: string;
  email: string;
  role: 'admin' | 'seller' | 'end-user';
  created_at: string;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  seller_id: string;
  seller_name: string;
  file_url?: string;
  in_stock: number;
  purchases: number;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  product_id: string;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  product?: Product;
};
