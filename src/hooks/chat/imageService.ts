
import { supabase } from '@/integrations/supabase/client';

export const uploadImageToStorage = async (file: File): Promise<string> => {
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('File size must be less than 2MB');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('chat-images')
    .upload(fileName, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('chat-images')
    .getPublicUrl(data.path);

  return publicUrl;
};
