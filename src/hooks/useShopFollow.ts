import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useShopFollow = (sellerId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch follow status and count
  useEffect(() => {
    if (!sellerId) return;

    const fetchFollowData = async () => {
      try {
        // Get followers count
        const { count } = await supabase
          .from('shop_follows')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', sellerId);

        setFollowersCount(count || 0);

        // Check if current user is following
        if (user) {
          const { data } = await supabase
            .from('shop_follows')
            .select('id')
            .eq('user_id', user.id)
            .eq('seller_id', sellerId)
            .maybeSingle();

          setIsFollowing(!!data);
        }
      } catch (error) {
        console.error('Error fetching follow data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowData();
  }, [sellerId, user]);

  const toggleFollow = async () => {
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để theo dõi cửa hàng",
        variant: "destructive",
      });
      return false;
    }

    if (user.id === sellerId) {
      toast({
        title: "Không thể theo dõi",
        description: "Bạn không thể theo dõi chính mình",
        variant: "destructive",
      });
      return false;
    }

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('shop_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('seller_id', sellerId);

        if (error) throw error;

        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        toast({
          title: "Đã hủy theo dõi",
          variant: "default",
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('shop_follows')
          .insert({ user_id: user.id, seller_id: sellerId });

        if (error) throw error;

        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast({
          title: "Đã theo dõi cửa hàng",
          variant: "default",
        });
      }
      return true;
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Có lỗi xảy ra",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    isFollowing,
    followersCount,
    loading,
    toggleFollow,
  };
};
