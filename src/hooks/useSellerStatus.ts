import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Use the database type directly instead of a custom interface
type SellerApplication = Database['public']['Tables']['seller_applications']['Row'];

export const useSellerStatus = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [sellerApplication, setSellerApplication] = useState<SellerApplication | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSellerApplication = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching seller application for user:', user.id);
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
        console.log('Seller application fetched:', data);
        setSellerApplication(data);
      }
    } catch (error) {
      console.error('Error in fetchSellerApplication:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSellerApplication();
  }, [fetchSellerApplication]);

  const getSellerStatus = () => {
    if (!user) {
      console.log('No user found, returning not_logged_in');
      return 'not_logged_in';
    }
    
    // If no profile yet, default to buyer but keep loading
    if (!profile) {
      console.log('No profile found, returning buyer');
      return 'buyer';
    }
    
    console.log('Checking seller status for profile role:', profile.role);
    
    // Check profile role - seller has full access
    if (profile.role === 'seller') {
      console.log('User is approved seller');
      return 'approved_seller';
    }
    
    // For end-users, check if they have submitted applications
    if (profile.role === 'end-user') {
      console.log('User is end-user, checking application status:', sellerApplication?.status);
      if (sellerApplication?.status === 'pending') return 'pending_approval';
      if (sellerApplication?.status === 'rejected') return 'rejected';
      return 'buyer'; // Default for end-users without applications
    }
    
    console.log('Fallback to buyer for role:', profile.role);
    return 'buyer'; // Fallback
  };

  const status = getSellerStatus();
  console.log('Final seller status:', status, { userRole: profile?.role, appStatus: sellerApplication?.status });

  return {
    sellerApplication,
    loading,
    sellerStatus: status,
    refreshStatus: fetchSellerApplication
  };
};

export type { SellerApplication };
