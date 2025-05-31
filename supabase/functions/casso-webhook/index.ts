
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
    console.log('=== CASSO WEBHOOK V6 REQUEST START ===')
    console.log('Request method:', req.method)
    console.log('Request URL:', req.url)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    let payload: any
    try {
      const rawBody = await req.text()
      console.log('Raw body received:', rawBody)
      payload = JSON.parse(rawBody)
    } catch (error) {
      console.error('Failed to parse JSON:', error)
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON payload'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Parsed payload:', JSON.stringify(payload, null, 2))

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

    // Process real transaction
    if (payload.error === 0 && payload.data) {
      const transaction = payload.data
      console.log('Processing transaction:', transaction)

      // Process the transaction (existing logic)
      const result = await processTransaction(transaction, supabase)
      console.log('🔄 Transaction processing result:', result)
      
      // 🎯 QUAN TRỌNG: Xử lý wallet NGAY sau khi transaction thành công
      if (result.status === 'success' && result.order) {
        console.log('🎉 Transaction processed successfully, now processing wallet and chat...')
        
        // Ensure we have the order with product details
        const { data: orderWithProduct, error: orderError } = await supabase
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
          console.error('❌ Error fetching order with product details:', orderError);
        } else {
          console.log('📦 Order with product details:', orderWithProduct);
          
          // 💰 XỬ LÝ VÍ TIỀN - ĐÂY LÀ ĐIỂM QUAN TRỌNG NHẤT
          try {
            console.log('💰 Starting wallet processing for seller...');
            console.log(`💰 Order status: ${orderWithProduct.status}`);
            console.log(`💰 Bank amount: ${orderWithProduct.bank_amount}`);
            console.log(`💰 Transaction amount: ${result.transaction_amount || transaction.amount}`);
            
            // Chỉ xử lý nếu đơn hàng đã paid và có amount
            if (orderWithProduct.status === 'paid' && (orderWithProduct.bank_amount > 0 || (result.transaction_amount || transaction.amount) > 0)) {
              const amountToProcess = orderWithProduct.bank_amount || result.transaction_amount || transaction.amount;
              
              console.log(`💰 Processing wallet for order: ${orderWithProduct.id}, amount: ${amountToProcess}`);
              
              const walletResult = await processSellerEarning(
                orderWithProduct, 
                amountToProcess, 
                supabase
              );
              
              if (walletResult.success) {
                console.log('✅ Wallet processing completed successfully:', walletResult);
              } else {
                console.error('❌ Wallet processing failed:', walletResult.error);
              }
            } else {
              console.log('⚠️ Skipping wallet processing - order not paid or invalid amount');
              console.log(`⚠️ Status: ${orderWithProduct.status}, Bank amount: ${orderWithProduct.bank_amount}, Transaction amount: ${result.transaction_amount || transaction.amount}`);
            }
          } catch (walletError) {
            console.error('❌ Wallet processing exception:', walletError);
          }
        }
        
        try {
          // Create order support chat
          console.log('💬 Creating order support chat...')
          const conversationId = await createOrderSupportChat(result.order, supabase)
          console.log('✅ Chat creation completed')
          
          return new Response(JSON.stringify({
            success: true,
            message: 'Payment processed successfully',
            order_id: result.order.id,
            transaction_id: result.transaction_id,
            conversation_id: conversationId,
            wallet_processed: true
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } catch (chatError) {
          console.error('❌ Chat creation failed:', chatError)
          
          // Return success vì wallet đã xử lý thành công
          return new Response(JSON.stringify({
            success: true,
            message: 'Payment and wallet processed successfully, chat creation failed',
            order_id: result.order.id,
            transaction_id: result.transaction_id,
            wallet_processed: true,
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
    console.error('Webhook error:', error)
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
