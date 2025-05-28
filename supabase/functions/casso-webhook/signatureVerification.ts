
// Hàm verify CASSO signature theo HMAC-SHA256
export async function verifyCassoSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  if (!signature || !secret) {
    console.error('Missing signature or secret for verification')
    return false
  }

  try {
    console.log('Verifying CASSO signature...')
    console.log('Payload length:', payload.length)
    console.log('Secret length:', secret.length)
    console.log('Raw signature from header:', signature)
    
    // Tạo HMAC-SHA256 signature
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // CASSO signature format handling
    // CASSO có thể gửi signature dưới nhiều format khác nhau
    let receivedSignature = signature.toLowerCase()
    
    // Remove các prefix có thể có
    receivedSignature = receivedSignature
      .replace(/^(sha256=|hmac-sha256=|casso-signature=)/, '')
      .replace(/^t=\d+,v1=/, '') // Remove timestamp prefix nếu có
    
    const normalizedExpected = expectedSignature.toLowerCase()
    
    console.log('Expected signature (normalized):', normalizedExpected)
    console.log('Received signature (normalized):', receivedSignature)
    
    // So sánh cả hai cách: có thể CASSO encode khác
    const isValid = normalizedExpected === receivedSignature
    
    // Nếu không khớp, thử encode với base64
    if (!isValid) {
      try {
        const base64Expected = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)))
        console.log('Trying base64 comparison:', base64Expected)
        const base64Valid = base64Expected === signature
        
        if (base64Valid) {
          console.log('✅ Signature valid with base64 encoding')
          return true
        }
      } catch (error) {
        console.log('Base64 comparison failed:', error)
      }
    }
    
    console.log('Signature verification result:', isValid)
    
    return isValid
  } catch (error) {
    console.error('Error verifying CASSO signature:', error)
    return false
  }
}
