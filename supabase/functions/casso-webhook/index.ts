
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CassoWebhookPayload, corsHeaders } from './types.ts'
import { verifyCassoSignature } from './signatureVerification.ts'
import { createResponse, createErrorResponse, createSuccessResponse } from './responseUtils.ts'
import { validatePayload, isTestWebhook } from './payloadValidator.ts'
import { processTransaction } from './transactionProcessor.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== CASSO WEBHOOK REQUEST START ===')
    console.log('Request method:', req.method)
    console.log('Request URL:', req.url)
    console.log('All headers:', Object.fromEntries(req.headers))

    // Get CASSO webhook secret
    const cassoSecret = Deno.env.get('CASSO_WEBHOOK_SECRET')
    if (!cassoSecret) {
      console.error('❌ CASSO_WEBHOOK_SECRET not configured')
      return createErrorResponse('Server configuration error', undefined, 500)
    }

    console.log('✅ CASSO secret configured, length:', cassoSecret.length)

    // Get raw body for signature verification
    let rawBody: string
    try {
      rawBody = await req.text()
      console.log('✅ Raw body received, length:', rawBody.length)
      console.log('Raw body preview:', rawBody.substring(0, 200) + '...')
    } catch (error) {
      console.error('❌ Failed to read request body:', error)
      return createErrorResponse('Failed to read request body')
    }

    // Get signature for verification
    const signature = req.headers.get('x-casso-signature')
    console.log('Signature found:', !!signature)
    if (signature) {
      console.log('Signature value:', signature)
    }

    // Parse JSON payload
    let payload: CassoWebhookPayload
    try {
      if (!rawBody.trim()) {
        throw new Error('Empty request body')
      }
      payload = JSON.parse(rawBody)
      console.log('✅ JSON parsed successfully')
      console.log('Payload structure:', {
        hasError: 'error' in payload,
        hasData: 'data' in payload,
        errorValue: payload.error,
        dataType: typeof payload.data,
        dataLength: Array.isArray(payload.data) ? payload.data.length : 'not array'
      })
    } catch (error) {
      console.error('❌ Invalid JSON payload:', error)
      return createErrorResponse('Invalid JSON payload', error.message)
    }

    // Check if this is a test webhook
    if (isTestWebhook(payload, signature)) {
      return createSuccessResponse({
        message: 'Test webhook received successfully',
        test: true
      })
    }

    // Verify CASSO signature for real transactions
    if (!signature) {
      console.error('❌ Missing x-casso-signature header for real transaction')
      return createErrorResponse('Missing signature for transaction', undefined, 403)
    }

    console.log('🔐 Starting signature verification...')
    try {
      const isValidSignature = await verifyCassoSignature(rawBody, signature, cassoSecret)
      
      if (!isValidSignature) {
        console.error('❌ SIGNATURE VERIFICATION FAILED')
        return createErrorResponse('Invalid signature', undefined, 403)
      }
      console.log('✅ CASSO signature verified successfully')
    } catch (signatureError) {
      console.error('❌ Error during signature verification:', signatureError)
      return createErrorResponse('Signature verification failed', signatureError.message, 403)
    }

    // Validate payload structure
    const validation = validatePayload(payload)
    if (!validation.isValid) {
      return createErrorResponse(validation.error!)
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const processedTransactions = []
    
    // Process each transaction
    for (const transaction of payload.data) {
      const result = await processTransaction(transaction, supabase)
      processedTransactions.push(result)
    }

    console.log('=== PROCESSING COMPLETE ===')
    console.log('Total transactions:', payload.data.length)
    console.log('Results:', processedTransactions)

    // Always return success response to CASSO
    return createSuccessResponse({
      message: 'Webhook processed successfully',
      total_transactions: payload.data.length,
      processed_transactions: processedTransactions
    })

  } catch (error) {
    console.error('❌ Webhook fatal error:', error)
    // Even on fatal error, return 200 to avoid CASSO retries
    return createErrorResponse('Internal server error', error.message)
  }
})
