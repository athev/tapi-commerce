
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { processTransaction } from './transactionProcessor.ts'
import { processSellerEarning } from './walletService.ts'
import { createOrderSupportChat } from './chatService.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== CASSO WEBHOOK REQUEST START ===')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    let payload: any
    try {
      const rawBody = await req.text()
      payload = JSON.parse(rawBody)
    } catch (error) {
      console.error('Failed to parse JSON')
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON payload'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Handle webhook test
    if (payload.error === 0 && payload.data && payload.data.id === 0) {
      console.log('🧪 Test webhook detected')
      return new Response(JSON.stringify({
        success: true,
        message: 'Test webhook received successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (payload.error === 0 && payload.data) {
      const transaction = payload.data

      const result = await processTransaction(transaction, supabase)
      
      if (result.status === 'success' && result.order) {
        const { data: orderWithSeller, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            products!inner(
              id,
              title,
              price,
              seller_id,
              seller_name
            )
          `)
          .eq('id', result.order.id)
          .single();

        if (orderError) {
          return new Response(JSON.stringify({
            success: true,
            message: 'Payment processed successfully, wallet processing failed',
            order_id: result.order.id,
            transaction_id: result.transaction_id,
            wallet_error: 'Failed to fetch order details'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        console.log('📦 Order with seller info fetched:', orderWithSeller);
        
        // 🔥 ĐIỀU KIỆN CHÍNH: Kiểm tra có đủ điều kiện cộng PI không
        const shouldProcessPI = (
          orderWithSeller.status === 'paid' && 
          orderWithSeller.bank_amount && 
          orderWithSeller.bank_amount > 0 &&
          orderWithSeller.products?.seller_id
        );

        console.log(`🎯 PI Processing Check:`);
        console.log(`  - Order Status: ${orderWithSeller.status}`);
        console.log(`  - Bank Amount: ${orderWithSeller.bank_amount}`);
        console.log(`  - Seller ID: ${orderWithSeller.products?.seller_id}`);
        console.log(`  - Should Process PI: ${shouldProcessPI}`);

        let walletProcessed = false;
        if (shouldProcessPI) {
          try {
            console.log('💰 Starting PI wallet processing...');
            
            const walletResult = await processSellerEarning(
              orderWithSeller, 
              orderWithSeller.bank_amount, 
              supabase
            );
            
            console.log('💰 Wallet processing result:', walletResult);
            
            if (walletResult.success) {
              console.log('✅ ✅ ✅ PI WALLET PROCESSING COMPLETED SUCCESSFULLY!');
              console.log(`💎 Added ${walletResult.piAmount} PI to seller ${orderWithSeller.products?.seller_id}'s wallet`);
              walletProcessed = true;
            } else {
              console.error('❌ ❌ ❌ PI WALLET PROCESSING FAILED:', walletResult.error);
            }
          } catch (walletError) {
            console.error('💥 WALLET PROCESSING EXCEPTION:', walletError);
          }
        } else {
          console.log('⚠️ Skipping PI processing - conditions not met');
        }
        
        // Create order support chat
        try {
          console.log('💬 Creating order support chat...')
          const conversationId = await createOrderSupportChat(result.order, supabase)
          console.log('✅ Chat creation completed')
          
          return new Response(JSON.stringify({
            success: true,
            message: 'Payment processed successfully',
            order_id: result.order.id,
            transaction_id: result.transaction_id,
            conversation_id: conversationId,
            wallet_processed: walletProcessed
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } catch (chatError) {
          console.error('❌ Chat creation failed:', chatError)
          
          // Return success vì main processing đã thành công
          return new Response(JSON.stringify({
            success: true,
            message: 'Payment processed successfully, chat creation failed',
            order_id: result.order.id,
            transaction_id: result.transaction_id,
            wallet_processed: walletProcessed,
            chat_error: chatError.message
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      // Return the original result if not successful
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Invalid payload
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid payload structure'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 WEBHOOK ERROR:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
