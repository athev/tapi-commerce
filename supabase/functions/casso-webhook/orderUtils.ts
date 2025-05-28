
// Hàm extract order ID từ description - cải thiện để xử lý format mới
export function extractOrderId(description: string): string | null {
  console.log('Extracting order ID from description:', description)
  
  // Tìm pattern DH + 12 ký tự hex (format mới từ CASSO)
  const newFormatPattern = /DH([A-F0-9]{12})/i
  const newFormatMatch = description.match(newFormatPattern)
  
  if (newFormatMatch) {
    const shortCode = newFormatMatch[1]
    console.log('Found new format short code:', shortCode)
    
    // Trả về pattern để tìm kiếm trong database với LIKE
    return `%${shortCode.toLowerCase()}`
  }
  
  // Fallback: Tìm pattern cũ với UUID đầy đủ
  const patterns = [
    // Pattern có dấu # và dấu gạch ngang (format cũ)
    /DH#([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
    // Pattern có DH nhưng không có dấu #, có dấu gạch ngang
    /DH([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
    // Pattern chỉ có UUID với dấu gạch ngang
    /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
    // Pattern có DH# nhưng UUID không có dấu gạch ngang (32 ký tự liền)
    /DH#([a-f0-9]{32})/i,
    // Pattern có DH nhưng UUID không có dấu gạch ngang (32 ký tự liền)
    /DH([a-f0-9]{32})/i,
    // Pattern chỉ có UUID không dấu gạch ngang (32 ký tự liền)
    /([a-f0-9]{32})/i
  ]
  
  for (const pattern of patterns) {
    const match = description.match(pattern)
    if (match) {
      let extractedId = match[1]
      console.log('Raw extracted ID (old format):', extractedId)
      
      // Normalize UUID (thêm dấu gạch ngang nếu cần)
      const normalizedId = normalizeOrderId(extractedId)
      
      console.log('Successfully extracted and normalized order ID:', normalizedId)
      return normalizedId
    }
  }
  
  console.log('No order ID found in description')
  return null
}

// Hàm normalize order ID từ 32 ký tự thành UUID chuẩn
export function normalizeOrderId(id: string): string {
  console.log('Normalizing order ID:', id)
  
  // Nếu đã có dấu gạch ngang hoặc không phải 32 ký tự, trả về nguyên
  if (id.includes('-') || id.length !== 32) {
    console.log('Order ID already normalized or invalid length:', id)
    return id
  }
  
  // Chuyển đổi 32 ký tự thành UUID chuẩn
  const normalized = [
    id.slice(0, 8),
    id.slice(8, 12),
    id.slice(12, 16),
    id.slice(16, 20),
    id.slice(20, 32)
  ].join('-')
  
  console.log('Normalized order ID from', id, 'to', normalized)
  return normalized
}
