
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Copy the functions locally since edge functions can't import from other function directories
function extractOrderId(description: string): string | null {
  console.log('🔍 Extracting order ID from description:', description)
  
  if (!description || typeof description !== 'string') {
    console.log('❌ Invalid description provided')
    return null
  }
  
  // Clean description - loại bỏ khoảng trắng thừa, dấu và normalize
  const cleanDesc = description.trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
  
  console.log('🔧 Cleaned description:', cleanDesc)
  
  // CRITICAL FIX: Loại bỏ các đoạn dư thừa do ngân hàng tạo ra TRƯỚC KHI extract
  const bankSuffixPatterns = [
    /\s*ft\d+\s*/gi,  // FT + số
    /\s*ma\s*giao\s*dich\s*/gi,  // "Ma giao dich"
    /\s*trace\s*\d+\s*/gi,  // Trace + số
    /\s*ref\s*\d+\s*/gi,  // Ref + số
    /\s*ib\s*ft\s*\d+\s*/gi,  // IB FT + số
    /\s*napas\s*/gi,  // NAPAS
    /\s*\d{10,}\s*/g,  // Chuỗi số dài (từ 10 chữ số trở lên)
  ]
  
  let processedDesc = cleanDesc
  for (const pattern of bankSuffixPatterns) {
    const before = processedDesc
    processedDesc = processedDesc.replace(pattern, ' ')
    if (before !== processedDesc) {
      console.log(`🔧 Removed bank suffix with pattern ${pattern}:`, before, '->', processedDesc)
    }
  }
  
  // Loại bỏ khoảng trắng thừa sau khi xóa suffix
  processedDesc = processedDesc.replace(/\s+/g, ' ').trim()
  console.log('🔧 Final processed description:', processedDesc)
  
  // Các pattern để tìm order ID theo thứ tự ưu tiên - CẢI THIỆN với LIKE pattern
  const patterns = [
    // Pattern chính: DH + 32 ký tự hex (không có dấu gạch ngang)
    /dh\s*([a-f0-9]{32})/i,
    // Pattern với khoảng trắng: DH + space + 32 ký tự hex  
    /dh\s+([a-f0-9]{32})/i,
    // Pattern với #: DH# + 32 ký tự hex
    /dh#\s*([a-f0-9]{32})/i,
    // Pattern UUID đầy đủ với dấu gạch ngang
    /dh\s*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
    
    // IMPROVED: Pattern cho hex ngắn (8-24 ký tự) - để xử lý trường hợp như DH4D3D37EDEC53
    /dh\s*([a-f0-9]{8,31})/i,  // Tăng từ 24 lên 31 để capture tốt hơn
    /dh#\s*([a-f0-9]{8,31})/i,
    
    // Pattern chỉ có hex string 32 ký tự (nếu không có DH prefix)
    /^([a-f0-9]{32})$/i,
    // Pattern chỉ có UUID đầy đủ
    /^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i,
    // Pattern hex ngắn ở đầu chuỗi
    /^([a-f0-9]{8,31})$/i
  ]
  
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i]
    const match = processedDesc.match(pattern)
    if (match) {
      let extractedId = match[1].toLowerCase()
      console.log(`✅ Pattern ${i + 1} matched, raw extracted ID:`, extractedId)
      
      // Validate extracted ID không chứa ký tự không mong muốn
      if (!/^[a-f0-9-]+$/.test(extractedId)) {
        console.log('⚠️ Extracted ID contains invalid characters, skipping:', extractedId)
        continue
      }
      
      // Normalize về UUID chuẩn nếu là 32 ký tự hex
      if (extractedId.length === 32 && !extractedId.includes('-')) {
        extractedId = normalizeOrderId(extractedId)
      }
      
      console.log('✅ Successfully extracted order ID:', extractedId)
      return extractedId
    }
  }
  
  console.log('❌ No order ID pattern found in processed description')
  return null
}

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

function isOrderMatch(orderId: string, extractedId: string): boolean {
  console.log('🔍 Checking order match:', { orderId, extractedId })
  
  // Chuẩn hóa order ID (bỏ dấu gạch ngang, chuyển thường)
  const orderHex = orderId.replace(/-/g, '').toLowerCase()
  const extracted = extractedId.toLowerCase().replace(/-/g, '')
  
  console.log('🔍 Normalized comparison:', { orderHex, extracted })
  
  // Exact match with UUID
  if (orderId === extractedId) {
    console.log('✅ Exact UUID match')
    return true
  }
  
  // Match với hex đầy đủ
  if (orderHex === extracted) {
    console.log('✅ Full hex match')
    return true
  }
  
  // CRITICAL FIX: Match với prefix (từ 8 ký tự trở lên)
  if (extracted.length >= 8 && orderHex.startsWith(extracted)) {
    console.log('✅ Prefix hex match', { orderPrefix: orderHex.slice(0, extracted.length), extracted })
    return true
  }
  
  // ADDITIONAL: Reverse check - extracted có thể là UUID đầy đủ mà order ID là prefix
  if (extracted.length >= 32 && extracted.startsWith(orderHex.slice(0, 12))) {
    console.log('✅ Reverse prefix match')
    return true
  }
  
  // NEW: LIKE pattern matching - kiểm tra xem extractedId có chứa trong orderId không
  if (orderHex.includes(extracted) || extracted.includes(orderHex.slice(0, 8))) {
    console.log('✅ LIKE pattern match')
    return true
  }
  
  console.log('❌ No match found')
  return false
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
