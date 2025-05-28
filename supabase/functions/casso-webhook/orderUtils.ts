
// Hàm extract order ID từ description - cải thiện để xử lý theo chuẩn Casso
export function extractOrderId(description: string): string | null {
  console.log('🔍 Extracting order ID from description:', description)
  
  if (!description || typeof description !== 'string') {
    console.log('❌ Invalid description provided')
    return null
  }
  
  // Clean description - loại bỏ khoảng trắng thừa
  const cleanDesc = description.trim()
  console.log('🔧 Cleaned description:', cleanDesc)
  
  // Các pattern để tìm order ID theo thứ tự ưu tiên - tuân thủ chuẩn Casso
  const patterns = [
    // Pattern chính theo chuẩn Casso: DH + space + UUID đầy đủ
    /DH\s+([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
    // Pattern không có space (backward compatibility)
    /DH([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
    // Pattern với # (legacy support)
    /DH#\s*([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
    // Pattern chỉ có UUID đầy đủ
    /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
    // Pattern 32 ký tự hex liền (cho các format cũ)
    /DH\s*#?([a-f0-9]{32})/i,
    /([a-f0-9]{32})/i
  ]
  
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i]
    const match = cleanDesc.match(pattern)
    if (match) {
      let extractedId = match[1].toLowerCase()
      console.log(`✅ Pattern ${i + 1} matched, raw extracted ID:`, extractedId)
      
      // Normalize UUID chuẩn nếu cần (cho format 32 ký tự)
      if (extractedId.length === 32) {
        extractedId = normalizeOrderId(extractedId)
      }
      
      console.log('✅ Successfully extracted and processed order ID:', extractedId)
      return extractedId
    }
  }
  
  console.log('❌ No order ID pattern found in description')
  return null
}

// Hàm normalize order ID từ 32 ký tự thành UUID chuẩn
export function normalizeOrderId(id: string): string {
  console.log('🔧 Normalizing order ID:', id)
  
  if (!id || typeof id !== 'string') {
    console.log('❌ Invalid ID provided for normalization')
    return id
  }
  
  // Loại bỏ dấu gạch ngang trước khi xử lý
  const cleanId = id.replace(/-/g, '')
  
  // Nếu không phải 32 ký tự, trả về nguyên
  if (cleanId.length !== 32) {
    console.log('⚠️ Order ID length not 32 chars, returning as-is:', id)
    return id
  }
  
  // Chuyển đổi 32 ký tự thành UUID chuẩn
  const normalized = [
    cleanId.slice(0, 8),
    cleanId.slice(8, 12),
    cleanId.slice(12, 16),
    cleanId.slice(16, 20),
    cleanId.slice(20, 32)
  ].join('-')
  
  console.log('✅ Normalized order ID from', id, 'to', normalized)
  return normalized
}
