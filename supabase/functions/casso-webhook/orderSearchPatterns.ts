
import { normalizeOrderId } from './orderIdExtractor.ts'

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
