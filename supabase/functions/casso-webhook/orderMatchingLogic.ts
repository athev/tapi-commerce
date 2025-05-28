
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
