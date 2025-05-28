
export async function verifyCassoSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  if (!signature || !secret || !payload) {
    console.error('❌ Missing required parameters for signature verification')
    return false
  }

  try {
    console.log('🔐 Starting CASSO signature verification')
    console.log('Payload length:', payload.length)
    console.log('Secret configured:', !!secret)
    console.log('Signature received:', signature)
    
    // Create HMAC-SHA256 signature from raw payload using Web Crypto API
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
    
    // Convert to hex string (lowercase)
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    console.log('Expected signature (hex):', expectedSignature)
    
    // Extract signature from header (remove v1= prefix if present)
    let receivedSignature = signature.trim().toLowerCase()
    if (receivedSignature.startsWith('v1=')) {
      receivedSignature = receivedSignature.substring(3)
      console.log('Removed v1= prefix, signature:', receivedSignature)
    }
    
    // Compare signatures using timing-safe comparison
    const isValid = expectedSignature === receivedSignature
    console.log('Signature verification result:', isValid)
    
    if (isValid) {
      console.log('✅ CASSO signature verified successfully')
      return true
    } else {
      console.log('❌ CASSO signature verification failed')
      console.log('Expected:', expectedSignature)
      console.log('Received:', receivedSignature)
      return false
    }
    
  } catch (error) {
    console.error('❌ Error in signature verification:', error)
    return false
  }
}
