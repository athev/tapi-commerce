
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSellerRegistration = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const { user, refreshProfile } = useAuth();

  const registerAsSeller = async () => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để đăng ký làm người bán');
      return false;
    }

    setIsRegistering(true);
    
    try {
      console.log('Registering user as seller:', user.id);
      
      // Update the user's profile role to 'seller'
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'seller' })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile to seller:', error);
        throw error;
      }

      console.log('Successfully updated profile to seller:', data);
      
      // Refresh the profile in the auth context
      await refreshProfile();
      
      toast.success('🎉 Đăng ký người bán thành công!', {
        description: 'Bạn đã có thể tạo và bán sản phẩm',
        duration: 3000,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error registering as seller:', error);
      
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        toast.error('Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.');
      } else {
        toast.error('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.');
      }
      
      return false;
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    isRegistering,
    registerAsSeller
  };
};
