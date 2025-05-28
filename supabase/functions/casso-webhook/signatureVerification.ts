
// Hàm verify CASSO signature theo tài liệu chính thức
export async function verifyCassoSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  if (!signature || !secret) {
    console.error('Missing signature or secret for verification')
    return false
  }

  try {
    console.log('=== CASSO SIGNATURE VERIFICATION START ===')
    console.log('Payload length:', payload.length)
    console.log('Secret configured:', !!secret)
    console.log('Received signature:', signature)
    
    // Tạo HMAC-SHA256 signature theo tài liệu CASSO
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
    
    // Chuyển đổi thành hex string (lowercase) theo format CASSO
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    console.log('Expected signature (hex):', expectedSignature)
    
    // Normalize received signature - loại bỏ các prefix có thể có
    let receivedSignature = signature.trim().toLowerCase()
    
    // Loại bỏ các prefix thường gặp
    const prefixes = ['sha256=', 'hmac-sha256=', 'casso-signature=']
    for (const prefix of prefixes) {
      if (receivedSignature.startsWith(prefix)) {
        receivedSignature = receivedSignature.substring(prefix.length)
        break
      }
    }
    
    console.log('Normalized signature:', receivedSignature)
    console.log('Signatures match:', expectedSignature === receivedSignature)
    
    if (expectedSignature === receivedSignature) {
      console.log('✅ CASSO signature verified successfully')
      return true
    }
    
    console.log('❌ CASSO signature verification failed')
    console.log('=== CASSO SIGNATURE VERIFICATION END ===')
    
    return false
  } catch (error) {
    console.error('Error verifying CASSO signature:', error)
    return false
  }
}
