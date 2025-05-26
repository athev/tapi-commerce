
import { supabase } from '@/integrations/supabase/client';

// Update conversation to reflect current product being discussed
export const updateConversationProduct = async (conversationId: string, productId: string) => {
  console.log('Updating conversation product context:', { conversationId, productId });
  
  const { error } = await supabase
    .from('conversations')
    .update({ 
      product_id: productId,
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId);

  if (error) {
    console.error('Error updating conversation product:', error);
    throw error;
  } else {
    console.log('Successfully updated conversation product context');
  }
};
