
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Import the refactored functions
import { extractOrderId, normalizeOrderId } from '../casso-webhook/orderIdExtractor.ts'
import { isOrderMatch } from '../casso-webhook/orderMatchingLogic.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting debug for Casso transactions...')

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // FIXED: Get query parameters - default to user's real case
    const url = new URL(req.url)
    const testDescription = url.searchParams.get('description') || 'DH4D3D37EDEC53'
    const testOrderId = url.searchParams.get('order_id') || '4d3d37ed-ec53-4878-9efe-0cf94bbd41b'
    
    console.log('Testing with description:', testDescription)
    console.log('Testing with order ID:', testOrderId)

    // Test order ID extraction
    const extractedId = extractOrderId(testDescription)
    console.log('Extracted order ID:', extractedId)

    // FIXED: Test flexible matching with detailed logging
    const orderHex = testOrderId.replace(/-/g, '').toLowerCase()
    const extracted = extractedId?.toLowerCase() || ''
    
    console.log('🔍 Detailed matching analysis:', {
      testOrderId,
      orderHex,
      extractedId,
      extracted,
      orderHexPrefix12: orderHex.slice(0, 12),
      orderHexPrefix13: orderHex.slice(0, 13),
      extractedLength: extracted.length,
      prefixMatch: orderHex.startsWith(extracted),
      exactMatch: orderHex === extracted
    })
    
    const matchResults = {
      exact_uuid: testOrderId === extracted,
      full_hex: orderHex === extracted,
      prefix_match: extracted.length >= 8 && orderHex.startsWith(extracted),
      prefix_analysis: {
        order_hex_prefix: orderHex.slice(0, extracted.length),
        extracted_id: extracted,
        matches: orderHex.slice(0, extracted.length) === extracted
      },
      is_order_match_result: isOrderMatch(testOrderId, extractedId || '')
    }

    // Check recent transactions
    const { data: recentTransactions, error: transError } = await supabase
      .from('casso_transactions')
      .select('*')
      .ilike('description', `%${testDescription}%`)
      .order('created_at', { ascending: false })
      .limit(5)

    console.log('Matching transactions:', recentTransactions)

    // Check the specific order
    const { data: specificOrder, error: orderError } = await supabase
      .from('orders')
      .select(`
        id, status, payment_verified_at, casso_transaction_id, created_at,
        products (price, title)
      `)
      .eq('id', testOrderId)
      .maybeSingle()

    // FIXED: Check recent orders that COULD match with prefix
    const { data: recentOrders, error: recentOrderError } = await supabase
      .from('orders')
      .select(`
        id, status, payment_verified_at, casso_transaction_id, created_at,
        products (price, title)
      `)
      .eq('status', 'pending')
      .is('payment_verified_at', null)
      .order('created_at', { ascending: false })
      .limit(10)

    console.log('Recent pending orders:', recentOrders?.map(o => ({
      id: o.id,
      hex_prefix_12: o.id.replace(/-/g, '').slice(0, 12).toUpperCase(),
      hex_prefix_13: o.id.replace(/-/g, '').slice(0, 13).toUpperCase(),
      status: o.status,
      would_match_with_extracted: isOrderMatch(o.id, extractedId || '')
    })))

    // Check unmatched transactions
    const { data: unmatchedTransactions } = await supabase
      .from('unmatched_transactions')
      .select('*')
      .ilike('description', `%${testDescription}%`)
      .order('created_at', { ascending: false })
      .limit(5)

    const response = {
      test_input: {
        description: testDescription,
        order_id: testOrderId
      },
      extraction_result: {
        extracted_id: extractedId,
        match_analysis: matchResults
      },
      database_checks: {
        specific_order: specificOrder ? {
          id: specificOrder.id,
          status: specificOrder.status,
          payment_verified: !!specificOrder.payment_verified_at,
          casso_linked: !!specificOrder.casso_transaction_id,
          price: specificOrder.products?.price
        } : null,
        matching_transactions: recentTransactions?.length || 0,
        unmatched_transactions: unmatchedTransactions?.length || 0,
        pending_orders_count: recentOrders?.length || 0
      },
      debugging_info: {
        order_hex_full: testOrderId.replace(/-/g, '').toLowerCase(),
        order_hex_prefix_12: testOrderId.replace(/-/g, '').slice(0, 12).toUpperCase(),
        order_hex_prefix_13: testOrderId.replace(/-/g, '').slice(0, 13).toUpperCase(),
        extracted_matches_prefix: extracted === testOrderId.replace(/-/g, '').slice(0, extracted.length).toLowerCase(),
        recent_pending_orders: recentOrders?.map(o => ({
          id: o.id,
          hex_prefix_12: o.id.replace(/-/g, '').slice(0, 12).toUpperCase(),
          hex_prefix_13: o.id.replace(/-/g, '').slice(0, 13).toUpperCase(),
          would_match: isOrderMatch(o.id, extractedId || '')
        })) || []
      }
    }

    return new Response(JSON.stringify(response, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Debug error:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
