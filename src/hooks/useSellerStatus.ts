
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
      console.error('Error in fetchSellerApplication:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSellerApplication();
  }, [fetchSellerApplication]);

  // Listen for changes in seller applications table
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('seller-application-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seller_applications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Seller application changed:', payload);
          // Refresh both application and profile when status changes
          fetchSellerApplication();
          refreshProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchSellerApplication, refreshProfile]);

  // Listen for profile changes
  useEffect(() => {
    if (!user) return;

    const profileChannel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Profile changed:', payload);
          refreshProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [user?.id, refreshProfile]);

  const getSellerStatus = () => {
    if (!user) return 'not_logged_in';
    
    console.log('getSellerStatus check:', { 
      userRole: profile?.role, 
      applicationStatus: sellerApplication?.status 
    });
    
    // Always check profile role first - this is the source of truth
    if (profile?.role === 'seller') return 'approved_seller';
    
    // Then check application status
    if (sellerApplication?.status === 'pending') return 'pending_approval';
    if (sellerApplication?.status === 'rejected') return 'rejected';
    
    return 'buyer'; // Default role
  };

  return {
    sellerApplication,
    loading,
    sellerStatus: getSellerStatus(),
    refreshSellerStatus: () => {
      fetchSellerApplication();
      refreshProfile();
    }
  };
};

export type { SellerApplication };
