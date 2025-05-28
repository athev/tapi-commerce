
// Hàm extract order ID từ description - cải thiện để xử lý nhiều format
export function extractOrderId(description: string): string | null {
  console.log('Extracting order ID from description:', description)
  
  if (!description || typeof description !== 'string') {
    console.log('Invalid description provided')
    return null
  }
  
  // Clean description - loại bỏ khoảng trắng thừa và ký tự đặc biệt
  const cleanDesc = description.trim().replace(/[^\w\-#]/gi, '')
  console.log('Cleaned description:', cleanDesc)
  
  // Các pattern để tìm order ID theo thứ tự ưu tiên
  const patterns = [
    // Pattern mới từ CASSO: DH + 12 ký tự hex
    /DH([A-F0-9]{12})/i,
    // Pattern có dấu # và UUID đầy đủ
    /DH#([a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12})/i,
    // Pattern có DH nhưng không có dấu #
    /DH([a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12})/i,
    // Pattern chỉ có UUID
    /([a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12})/i,
    // Pattern 32 ký tự hex liền
    /DH#?([a-f0-9]{32})/i,
    /([a-f0-9]{32})/i
  ]
  
  for (const pattern of patterns) {
    const match = cleanDesc.match(pattern)
    if (match) {
      let extractedId = match[1].toLowerCase()
      console.log('Raw extracted ID:', extractedId)
      
      // Xử lý format mới từ CASSO (12 ký tự hex)
      if (extractedId.length === 12 && /^[a-f0-9]{12}$/.test(extractedId)) {
        console.log('Found CASSO new format (12 hex chars):', extractedId)
        // Trả về pattern để tìm kiếm với ILIKE
        return `%${extractedId}%`
      }
      
      // Normalize UUID chuẩn
      const normalizedId = normalizeOrderId(extractedId)
      console.log('Successfully extracted and normalized order ID:', normalizedId)
      return normalizedId
    }
  }
  
  console.log('No order ID found in description')
  return null
}

// Hàm normalize order ID từ nhiều format khác nhau
export function normalizeOrderId(id: string): string {
  console.log('Normalizing order ID:', id)
  
  if (!id || typeof id !== 'string') {
    console.log('Invalid ID provided for normalization')
    return id
  }
  
  // Loại bỏ dấu gạch ngang trước khi xử lý
  const cleanId = id.replace(/-/g, '')
  
  // Nếu không phải 32 ký tự, trả về nguyên
  if (cleanId.length !== 32) {
    console.log('Order ID length not 32 chars, returning as-is:', id)
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
  
  console.log('Normalized order ID from', id, 'to', normalized)
  return normalized
}
