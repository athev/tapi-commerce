
// Hàm extract order ID từ description - cải thiện để xử lý chính xác theo format DH + hex
export function extractOrderId(description: string): string | null {
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

// Hàm tạo các pattern tìm kiếm cho order ID
export function generateSearchPatterns(orderId: string): string[] {
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
