
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SepayWebhookPayload } from './types.ts'
import { validatePayload, isTestWebhook } from './payloadValidator.ts'
import { verifyApiKey } from './apiKeyVerification.ts'
import { saveTransaction } from './transactionStorage.ts'
import { processOrderPayment } from './paymentProcessor.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🎯 ===== SEPAY WEBHOOK RECEIVED =====')
    console.log('📨 Method:', req.method)
    console.log('🔗 URL:', req.url)

    // Khởi tạo Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Lấy API Key từ environment
    const expectedApiKey = Deno.env.get('SEPAY_API_KEY')
    if (!expectedApiKey) {
      console.error('❌ [SEPAY] SEPAY_API_KEY not configured')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify API Key từ header
    const authHeader = req.headers.get('Authorization')
    if (!verifyApiKey(authHeader, expectedApiKey)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid API Key' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse payload
    const payload: SepayWebhookPayload = await req.json()
    console.log('📦 [SEPAY] Payload received:', JSON.stringify(payload, null, 2))

    // Kiểm tra test webhook
    if (isTestWebhook(payload)) {
      console.log('🧪 [SEPAY] Test webhook detected, returning success')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Test webhook received successfully' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate payload
    const validation = validatePayload(payload)
    if (!validation.isValid) {
      console.error('❌ [SEPAY] Payload validation failed:', validation.error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: validation.error 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Lưu transaction vào database
    const { transactionId, alreadyExists, insertResult } = await saveTransaction(payload, supabase)
    console.log(`💾 [SEPAY] Transaction saved with ID: ${transactionId}`)

    // Skip processing if already processed
    if (alreadyExists && insertResult[0]?.processed) {
      console.log(`⏭️ [SEPAY] Transaction already processed, skipping`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Transaction already processed',
          transaction_id: transactionId,
          status: 'already_processed'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Xử lý order payment
    console.log('🔄 [SEPAY] Processing order payment...')
    const processingResult = await processOrderPayment(payload, transactionId, supabase)
    
    console.log('📊 [SEPAY] Processing result:', processingResult)

    // Nếu payment thành công, xử lý wallet
    if (processingResult.status === 'success' && processingResult.order) {
      console.log('💰 [SEPAY] Processing wallet updates...')
      
      try {
        const { processWalletUpdate } = await import('../casso-webhook/walletService.ts')
        await processWalletUpdate(
          processingResult.order,
          processingResult.transaction_amount!,
          transactionId,
          supabase
        )
        console.log('✅ [SEPAY] Wallet updated successfully')
      } catch (walletError) {
        console.error('⚠️ [SEPAY] Wallet update error (non-critical):', walletError)
      }
    }

    // Trả về response theo chuẩn SEPAY
    console.log('✅ ===== SEPAY WEBHOOK PROCESSING COMPLETED =====')
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Webhook processed successfully',
        result: processingResult
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 [SEPAY] Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
