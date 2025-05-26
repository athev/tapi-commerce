
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'emoji';
  image_url?: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  sender_role?: string;
}

export interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id?: string;
  order_id?: string;
  chat_type: 'product_consultation' | 'order_support';
  last_message_at: string;
  buyer_unread_count: number;
  seller_unread_count: number;
  created_at: string;
  product?: {
    id: string;
    title: string;
    image?: string;
    seller_name?: string;
    product_type?: string;
  };
  order?: {
    id: string;
    status: string;
    created_at: string;
    delivery_status?: string;
    products?: {
      title: string;
      price: number;
    };
  };
  other_user?: {
    id: string;
    full_name: string;
    role?: string;
  };
  buyer_name?: string;
  seller_name?: string;
  // For grouped conversations
  related_products?: {
    id: string;
    title: string;
    image?: string;
  }[];
  related_orders?: {
    id: string;
    status: string;
    products?: {
      title: string;
      price: number;
    };
  }[];
}
