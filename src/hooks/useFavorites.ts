import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch favorites
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user?.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.product_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để sử dụng tính năng yêu thích",
        variant: "destructive",
      });
      return;
    }

    const isFavorited = favorites.includes(productId);

    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
        
        // Decrement favorites_count on product
        await supabase.rpc('decrement_favorites_count', { product_id: productId });
        
        setFavorites(prev => prev.filter(id => id !== productId));
        toast({
          title: "Đã xóa khỏi yêu thích",
          variant: "default",
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, product_id: productId });

        if (error) throw error;
        
        // Increment favorites_count on product
        await supabase.rpc('increment_favorites_count', { product_id: productId });
        
        setFavorites(prev => [...prev, productId]);
        toast({
          title: "Đã thêm vào yêu thích",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Có lỗi xảy ra",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    favoriteCount: favorites.length,
  };
};
