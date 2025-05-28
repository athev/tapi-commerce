
// Hàm extract order ID từ description - cải thiện để xử lý chính xác theo format DH + hex và loại bỏ đoạn dư thừa ngân hàng
export function extractOrderId(description: string): string | null {
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

// Hàm normalize order ID từ 32 ký tự hex thành UUID chuẩn
export function normalizeOrderId(hexId: string): string {
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

// Hàm tạo các pattern tìm kiếm cho order ID - CẢI TIẾN để hỗ trợ tìm kiếm linh hoạt
export function generateSearchPatterns(extractedId: string): string[] {
  console.log('🔍 Generating search patterns for extracted ID:', extractedId)
  
  const patterns = []
  
  // Nếu là UUID đầy đủ
  if (extractedId.includes('-') && extractedId.length === 36) {
    const hexVersion = extractedId.replace(/-/g, '').toUpperCase()
    patterns.push(
      extractedId, // UUID gốc
      hexVersion,  // Hex đầy đủ
      hexVersion.slice(0, 8), // 8 ký tự đầu
      hexVersion.slice(0, 12), // 12 ký tự đầu  
      hexVersion.slice(0, 16)  // 16 ký tự đầu
    )
  }
  // Nếu là hex ngắn (8-31 ký tự)
  else if (extractedId.length >= 8 && extractedId.length <= 31) {
    patterns.push(extractedId.toLowerCase())
  }
  // Nếu là hex dài (32 ký tự)
  else if (extractedId.length === 32) {
    const normalized = normalizeOrderId(extractedId)
    patterns.push(
      normalized,  // UUID chuẩn
      extractedId, // Hex gốc
      extractedId.slice(0, 8), // 8 ký tự đầu
      extractedId.slice(0, 12), // 12 ký tự đầu
      extractedId.slice(0, 16)  // 16 ký tự đầu
    )
  }
  
  console.log('✅ Generated search patterns:', patterns)
  return [...new Set(patterns)] // Remove duplicates
}

// IMPROVED: Hàm kiểm tra match linh hoạt - cải thiện để xử lý prefix matching và LIKE pattern
export function isOrderMatch(orderId: string, extractedId: string): boolean {
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
