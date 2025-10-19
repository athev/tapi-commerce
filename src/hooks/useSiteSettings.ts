import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SiteSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

export const useSiteSettings = (key?: string, category?: string) => {
  return useQuery({
    queryKey: ['site-settings', key, category],
    queryFn: async () => {
      if (key) {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', key)
          .single();
        if (error) throw error;
        return data as SiteSetting;
      } else if (category) {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('category', category);
        if (error) throw error;
        return data as SiteSetting[];
      } else {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*');
        if (error) throw error;
        return data as SiteSetting[];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateSiteSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data: session } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from('site_settings')
        .update({ 
          value,
          updated_by: session.session?.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Cập nhật thành công');
    },
    onError: (error) => {
      console.error('Error updating setting:', error);
      toast.error('Có lỗi xảy ra khi cập nhật');
    },
  });
};

export const useCreateSiteSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (setting: Omit<SiteSetting, 'id' | 'updated_at' | 'updated_by'>) => {
      const { data: session } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from('site_settings')
        .insert({
          ...setting,
          updated_by: session.session?.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Tạo mới thành công');
    },
    onError: (error) => {
      console.error('Error creating setting:', error);
      toast.error('Có lỗi xảy ra khi tạo mới');
    },
  });
};
