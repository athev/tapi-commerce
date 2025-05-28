
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
    
    // So sánh signature (remove prefix nếu có và normalize)
    const receivedSignature = signature.replace(/^(sha256=|SHA256=)/, '').toLowerCase()
    const normalizedExpected = expectedSignature.toLowerCase()
    
    console.log('Expected signature (normalized):', normalizedExpected)
    console.log('Received signature (normalized):', receivedSignature)
    
    const isValid = normalizedExpected === receivedSignature
    
    console.log('Signature verification result:', isValid)
    
    return isValid
  } catch (error) {
    console.error('Error verifying CASSO signature:', error)
    return false
  }
}
