
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { extractOrderId, generateSearchPatterns } from '../casso-webhook/orderUtils.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // Get query parameters
    const url = new URL(req.url)
    const testDescription = url.searchParams.get('description') || 'DH335F6DB3DAF7'
    
    console.log('Testing with description:', testDescription)

    // Test order ID extraction
    const extractedId = extractOrderId(testDescription)
    console.log('Extracted order ID:', extractedId)

    // Generate search patterns
    const searchPatterns = extractedId ? generateSearchPatterns(extractedId) : []
    console.log('Search patterns:', searchPatterns)

    // Check recent transactions
    const { data: recentTransactions, error: transError } = await supabase
      .from('casso_transactions')
      .select('*')
      .ilike('description', `%${testDescription}%`)
      .order('created_at', { ascending: false })
      .limit(5)

    console.log('Matching transactions:', recentTransactions)

    // Check recent orders
    const { data: recentOrders, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        payment_verified_at,
        casso_transaction_id,
        created_at,
        products (price, title)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    console.log('Recent orders:', recentOrders)

    // Try to find matching orders for each pattern
    const orderMatches = []
    if (searchPatterns.length > 0) {
      for (const pattern of searchPatterns) {
        const { data: matchingOrders } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            payment_verified_at,
            casso_transaction_id,
            created_at,
            products (price, title)
          `)
          .eq('id', pattern)
          .limit(1)

        if (matchingOrders && matchingOrders.length > 0) {
          orderMatches.push({
            pattern: pattern,
            orders: matchingOrders
          })
        }
      }
    }

    // Check unmatched transactions
    const { data: unmatchedTransactions } = await supabase
      .from('unmatched_transactions')
      .select('*')
      .ilike('description', `%${testDescription}%`)
      .order('created_at', { ascending: false })
      .limit(5)

    const response = {
      test_description: testDescription,
      extracted_order_id: extractedId,
      search_patterns: searchPatterns,
      matching_transactions: recentTransactions,
      recent_orders: recentOrders?.map(o => ({
        id: o.id,
        short_id: o.id.slice(0, 8),
        status: o.status,
        payment_verified: !!o.payment_verified_at,
        casso_linked: !!o.casso_transaction_id,
        price: o.products?.price
      })),
      order_matches: orderMatches,
      unmatched_transactions: unmatchedTransactions,
      debug_info: {
        patterns_generated: searchPatterns.length,
        transactions_found: recentTransactions?.length || 0,
        orders_matched: orderMatches.length,
        unmatched_found: unmatchedTransactions?.length || 0
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
