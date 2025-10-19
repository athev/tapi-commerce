import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './useUser';

export const useUserRoles = () => {
  const { user } = useUser();

  return useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;
      return data?.map(r => r.role) || [];
    },
    enabled: !!user,
  });
};

export const useHasRole = (requiredRole: string) => {
  const { data: roles, isLoading } = useUserRoles();
  return {
    hasRole: roles?.includes(requiredRole as any) || false,
    isLoading,
  };
};
