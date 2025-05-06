import { createClient } from '@supabase/supabase-js';

// For development: default values if environment variables are missing
// In production, these should be properly set in your environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Only log warnings in development, not errors that block execution
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables. Using default development values. This should not happen in production.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  email: string;
  role: 'admin' | 'seller' | 'end-user';
  created_at: string;
  full_name: string;  // Added this missing field
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
