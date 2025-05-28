
export async function verifyCassoSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  if (!signature || !secret || !payload) {
    console.error('❌ Missing required parameters for signature verification')
    return false
  }

  try {
    console.log('🔐 Starting CASSO signature verification')
    console.log('Payload length:', payload.length)
    console.log('Secret configured:', !!secret)
    console.log('Raw signature header:', signature)
    
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
    
    // Handle different signature formats from CASSO
    let receivedSignature = signature.trim()
    
    // Check if signature has timestamp prefix (t=timestamp,v1=signature)
    if (receivedSignature.includes('t=') && receivedSignature.includes('v1=')) {
      console.log('Detected timestamp-prefixed signature format')
      const parts = receivedSignature.split(',')
      const signaturePart = parts.find(part => part.startsWith('v1='))
      if (signaturePart) {
        receivedSignature = signaturePart.substring(3) // Remove 'v1='
        console.log('Extracted signature from v1= format:', receivedSignature)
      }
    } else if (receivedSignature.startsWith('v1=')) {
      // Simple v1= prefix
      receivedSignature = receivedSignature.substring(3)
      console.log('Removed v1= prefix, signature:', receivedSignature)
    }
    
    // Clean and normalize the received signature
    receivedSignature = receivedSignature.toLowerCase().trim()
    console.log('Final received signature (cleaned):', receivedSignature)
    
    // Compare signatures
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
      
      // Additional debugging
      console.log('Raw payload preview:', payload.substring(0, 200))
      console.log('Secret preview:', secret.substring(0, 8) + '...')
      
      return false
    }
    
  } catch (error) {
    console.error('❌ Error in signature verification:', error)
    return false
  }
}
