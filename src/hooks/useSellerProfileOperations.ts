
import { supabase } from '@/integrations/supabase/client';

export const useSellerProfileOperations = () => {
  const updateUserRoleToSeller = async (userId: string) => {
    console.log('Registering user as seller:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'seller' })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile to seller:', error);
      throw error;
    }

    console.log('Successfully updated profile to seller:', data);
    return data;
  };

  return {
    updateUserRoleToSeller
  };
};
