
export function verifyApiKey(authHeader: string | null, expectedApiKey: string): boolean {
  console.log('🔐 [SEPAY] Verifying API Key...')
  
  if (!authHeader) {
    console.error('❌ [SEPAY] No Authorization header provided')
    return false
  }

  // SEPAY gửi header dạng: "Apikey YOUR_API_KEY"
  const apiKeyMatch = authHeader.match(/^Apikey\s+(.+)$/i)
  
  if (!apiKeyMatch) {
    console.error('❌ [SEPAY] Invalid Authorization header format')
    return false
  }

  const providedApiKey = apiKeyMatch[1]
  
  if (providedApiKey !== expectedApiKey) {
    console.error('❌ [SEPAY] API Key mismatch')
    return false
  }

  console.log('✅ [SEPAY] API Key verified successfully')
  return true
}
