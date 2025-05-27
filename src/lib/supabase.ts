
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

// Add UserProfile alias for backward compatibility
export type UserProfile = Profile;

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

// Mock data for development and fallback
export const mockCategories = [
  { id: '1', name: 'Ebook', icon: '📚', count: 125 },
  { id: '2', name: 'Khóa học', icon: '🎓', count: 89 },
  { id: '3', name: 'Template', icon: '🎨', count: 156 },
  { id: '4', name: 'Phần mềm', icon: '💻', count: 67 },
  { id: '5', name: 'Video', icon: '🎬', count: 234 },
  { id: '6', name: 'Audio', icon: '🎵', count: 78 }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Khóa học Marketing Online từ A-Z',
    description: 'Học cách xây dựng chiến lược marketing hiệu quả cho doanh nghiệp của bạn',
    price: 299000,
    image: '/placeholder.svg',
    category: 'Khóa học',
    seller_id: 'seller1',
    seller_name: 'Marketing Pro',
    product_type: 'file_download',
    in_stock: 999,
    purchases: 156,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Template Website Landing Page',
    description: 'Bộ template chuyên nghiệp cho trang landing page bán hàng',
    price: 199000,
    image: '/placeholder.svg',
    category: 'Template',
    seller_id: 'seller2',
    seller_name: 'Design Studio',
    product_type: 'file_download',
    in_stock: 999,
    purchases: 89,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Ebook: Làm giàu từ đầu tư chứng khoán',
    description: 'Hướng dẫn đầu tư chứng khoán an toàn và hiệu quả',
    price: 149000,
    image: '/placeholder.svg',
    category: 'Ebook',
    seller_id: 'seller3',
    seller_name: 'Financial Expert',
    product_type: 'file_download',
    in_stock: 999,
    purchases: 267,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Phần mềm quản lý bán hàng',
    description: 'Giải pháp quản lý bán hàng toàn diện cho doanh nghiệp nhỏ',
    price: 599000,
    image: '/placeholder.svg',
    category: 'Phần mềm',
    seller_id: 'seller4',
    seller_name: 'Tech Solutions',
    product_type: 'license_key',
    in_stock: 50,
    purchases: 45,
    created_at: new Date().toISOString()
  }
];
