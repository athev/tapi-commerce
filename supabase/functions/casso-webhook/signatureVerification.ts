
export async function verifyCassoSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  if (!signature || !secret || !payload) {
    console.error('❌ Missing required parameters for signature verification')
    return false
  }

  try {
    console.log('🔐 Starting CASSO signature verification according to official docs')
    console.log('Payload length:', payload.length)
    console.log('Secret configured:', !!secret)
    console.log('Raw signature header:', signature)
    
    // Theo tài liệu Casso: tạo HMAC-SHA256 từ raw payload
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
    
    // Convert to hex string (lowercase) theo chuẩn Casso
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    console.log('Expected signature (hex):', expectedSignature)
    
    // Xử lý signature từ header theo tài liệu Casso
    let receivedSignature = signature.trim().toLowerCase()
    
    // Casso có thể gửi signature với các format khác nhau
    if (receivedSignature.includes('=')) {
      // Loại bỏ prefix nếu có (v1=, sha256=, etc.)
      const parts = receivedSignature.split('=')
      if (parts.length >= 2) {
        receivedSignature = parts[parts.length - 1] // Lấy phần cuối cùng
        console.log('Extracted signature after removing prefix:', receivedSignature)
      }
    }
    
    console.log('Final received signature (cleaned):', receivedSignature)
    
    // So sánh signatures
    const isValid = expectedSignature === receivedSignature
    console.log('Signature verification result:', isValid)
    
    if (isValid) {
      console.log('✅ CASSO signature verified successfully')
      return true
    } else {
      console.log('❌ CASSO signature verification failed')
      console.log('Expected:', expectedSignature)
      console.log('Received:', receivedSignature)
      console.log('Expected length:', expectedSignature.length)
      console.log('Received length:', receivedSignature.length)
      
      // Debug thông tin để khắc phục
      console.log('Raw payload first 200 chars:', payload.substring(0, 200))
      console.log('Secret first 8 chars:', secret.substring(0, 8) + '...')
      
      return false
    }
    
  } catch (error) {
    console.error('❌ Error in signature verification:', error)
    return false
  }
}
