
import { createClient } from '@supabase/supabase-js';

// Use the actual Supabase configuration
const supabaseUrl = 'https://vpogvgilorgkeulvnpbb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwb2d2Z2lsb3Jna2V1bHZucGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMTY1MjAsImV4cCI6MjA2MzU5MjUyMH0.fnYnpeGNV_FDZTswcjTdoyfaSUc4Rkt_a9F7BdH2oFw';

// Create a single instance to avoid multiple GoTrueClient warnings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
});

export type UserProfile = {
  id: string;
  email: string;
  role: 'admin' | 'seller' | 'end-user';
  created_at: string;
  full_name: string;
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

// Mock data for development when Supabase connection fails
export const mockCategories = [
  { id: '1', name: 'Ebook', icon: '/placeholder.svg', count: 12 },
  { id: '2', name: 'Khóa học', icon: '/placeholder.svg', count: 8 },
  { id: '3', name: 'Phần mềm', icon: '/placeholder.svg', count: 5 },
  { id: '4', name: 'Template', icon: '/placeholder.svg', count: 15 },
  { id: '5', name: 'Âm nhạc', icon: '/placeholder.svg', count: 7 }
];

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Ebook: Hướng dẫn đầu tư chứng khoán cho người mới bắt đầu',
    description: 'Cuốn sách điện tử giúp bạn bắt đầu hành trình đầu tư chứng khoán một cách an toàn và hiệu quả.',
    price: 99000,
    image: '/placeholder.svg',
    category: 'Ebook',
    seller_id: 'seller1',
    seller_name: 'Financial Expert',
    in_stock: 999,
    purchases: 124,
    created_at: '2025-04-01T08:30:00Z'
  },
  {
    id: '2',
    title: 'Khóa học: Thiết kế đồ họa với Photoshop từ A-Z',
    description: 'Học thiết kế đồ họa chuyên nghiệp với Photoshop qua 50+ bài giảng video HD.',
    price: 599000,
    image: '/placeholder.svg',
    category: 'Khóa học',
    seller_id: 'seller2',
    seller_name: 'DesignMaster',
    in_stock: 999,
    purchases: 89,
    created_at: '2025-04-10T10:15:00Z'
  },
  {
    id: '3',
    title: 'Phần mềm: Công cụ tự động hóa Social Media',
    description: 'Phần mềm giúp tự động hóa việc đăng bài, phân tích dữ liệu và tương tác trên các nền tảng mạng xã hội.',
    price: 790000,
    image: '/placeholder.svg',
    category: 'Phần mềm',
    seller_id: 'seller3',
    seller_name: 'SocialTech',
    in_stock: 50,
    purchases: 37,
    created_at: '2025-04-15T14:20:00Z'
  },
  {
    id: '4',
    title: 'Template: Bộ mẫu CV xin việc Premium',
    description: 'Bộ 15 mẫu CV đẹp, chuyên nghiệp và dễ tùy chỉnh cho nhiều ngành nghề.',
    price: 149000,
    image: '/placeholder.svg',
    category: 'Template',
    seller_id: 'seller4',
    seller_name: 'ResumeDesigner',
    in_stock: 999,
    purchases: 215,
    created_at: '2025-04-20T09:45:00Z'
  },
  {
    id: '5',
    title: 'Âm nhạc: Bộ nhạc nền không bản quyền cho video',
    description: '50 track nhạc nền đa dạng thể loại, không bản quyền, chất lượng cao cho các dự án video.',
    price: 259000,
    image: '/placeholder.svg',
    category: 'Âm nhạc',
    seller_id: 'seller5',
    seller_name: 'AudioProduction',
    in_stock: 999,
    purchases: 76,
    created_at: '2025-04-25T11:30:00Z'
  },
  {
    id: '6',
    title: 'Ebook: Bí quyết xây dựng thương hiệu cá nhân',
    description: 'Hướng dẫn chi tiết cách xây dựng và phát triển thương hiệu cá nhân mạnh mẽ trên các kênh online.',
    price: 129000,
    image: '/placeholder.svg',
    category: 'Ebook',
    seller_id: 'seller6',
    seller_name: 'BrandExpert',
    in_stock: 999,
    purchases: 103,
    created_at: '2025-05-01T13:15:00Z'
  }
];
