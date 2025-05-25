
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface SellerApplication {
  id: string;
  user_id: string;
  business_name: string;
  business_description: string;
  phone: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const useSellerStatus = () => {
  const { user, profile } = useAuth();
  const [sellerApplication, setSellerApplication] = useState<SellerApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('seller_applications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching seller application:', error);
        } else {
          setSellerApplication(data);
        }
      } catch (error) {
        console.error('Error in fetchSellerStatus:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerStatus();
  }, [user]);

  const getSellerStatus = () => {
    if (!user) return 'not_logged_in';
    if (profile?.role === 'seller') return 'approved_seller';
    if (sellerApplication?.status === 'pending') return 'pending_approval';
    if (sellerApplication?.status === 'rejected') return 'rejected';
    return 'buyer'; // Default role
  };

  return {
    sellerApplication,
    loading,
    sellerStatus: getSellerStatus()
  };
};
