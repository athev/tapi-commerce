
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Hàm extract order ID từ description - cải thiện để xử lý chính xác theo format DH + hex
function extractOrderId(description: string): string | null {
  console.log('🔍 Extracting order ID from description:', description)
  
  if (!description || typeof description !== 'string') {
    console.log('❌ Invalid description provided')
    return null
  }
  
  // Clean description - loại bỏ khoảng trắng thừa
  const cleanDesc = description.trim()
  console.log('🔧 Cleaned description:', cleanDesc)
  
  // Các pattern để tìm order ID theo thứ tự ưu tiên
  const patterns = [
    // Pattern chính: DH + 32 ký tự hex (không có dấu gạch ngang)
    /DH([A-F0-9]{32})/i,
    // Pattern với khoảng trắng: DH + space + 32 ký tự hex  
    /DH\s+([A-F0-9]{32})/i,
    // Pattern với #: DH# + 32 ký tự hex
    /DH#([A-F0-9]{32})/i,
    // Pattern với # và space: DH# + space + 32 ký tự hex
    /DH#\s+([A-F0-9]{32})/i,
    // Pattern UUID đầy đủ với dấu gạch ngang
    /DH([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
    /DH\s+([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
    // Pattern chỉ có hex string 32 ký tự
    /([A-F0-9]{32})/i,
    // Pattern chỉ có UUID đầy đủ
    /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i
  ]
  
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i]
    const match = cleanDesc.match(pattern)
    if (match) {
      let extractedId = match[1].toLowerCase()
      console.log(`✅ Pattern ${i + 1} matched, raw extracted ID:`, extractedId)
      
      // Normalize về UUID chuẩn nếu là 32 ký tự hex
      if (extractedId.length === 32) {
        extractedId = normalizeOrderId(extractedId)
      }
      
      console.log('✅ Successfully extracted and normalized order ID:', extractedId)
      return extractedId
    }
  }
  
  console.log('❌ No order ID pattern found in description')
  return null
}

// Hàm normalize order ID từ 32 ký tự hex thành UUID chuẩn
function normalizeOrderId(hexId: string): string {
  console.log('🔧 Normalizing hex ID to UUID:', hexId)
  
  if (!hexId || typeof hexId !== 'string') {
    console.log('❌ Invalid hex ID provided for normalization')
    return hexId
  }
  
  // Loại bỏ dấu gạch ngang nếu có
  const cleanHex = hexId.replace(/-/g, '').toLowerCase()
  
  // Nếu không phải 32 ký tự, trả về nguyên
  if (cleanHex.length !== 32) {
    console.log('⚠️ Hex ID length not 32 chars, returning as-is:', hexId)
    return hexId
  }
  
  // Chuyển đổi 32 ký tự thành UUID chuẩn
  const normalized = [
    cleanHex.slice(0, 8),
    cleanHex.slice(8, 12),
    cleanHex.slice(12, 16),
    cleanHex.slice(16, 20),
    cleanHex.slice(20, 32)
  ].join('-')
  
  console.log('✅ Normalized hex ID to UUID:', normalized)
  return normalized
}

// Hàm tạo các pattern tìm kiếm cho order ID
function generateSearchPatterns(orderId: string): string[] {
  console.log('🔍 Generating search patterns for order ID:', orderId)
  
  // Lấy hex version (bỏ dấu gạch ngang)
  const hexVersion = orderId.replace(/-/g, '').toUpperCase()
  
  const patterns = [
    // Exact UUID match
    orderId,
    // Hex version patterns
    `DH${hexVersion}`,
    `DH ${hexVersion}`,
    `DH#${hexVersion}`,
    `DH# ${hexVersion}`,
    // Just hex string
    hexVersion,
    // Mixed case patterns
    `dh${hexVersion.toLowerCase()}`,
    `DH${hexVersion.toLowerCase()}`,
  ]
  
  console.log('✅ Generated search patterns:', patterns)
  return patterns
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
