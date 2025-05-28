
export async function verifyCassoSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  if (!signature || !secret || !payload) {
    console.error('❌ Missing required parameters for signature verification')
    return false
  }

  try {
    console.log('🔐 Starting CASSO signature verification')
    console.log('Payload length:', payload.length)
    console.log('Secret configured:', !!secret)
    console.log('Signature received:', signature.substring(0, 20) + '...')
    
    // Create HMAC-SHA256 signature
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
    
    console.log('Expected signature (hex):', expectedSignature.substring(0, 20) + '...')
    
    // Normalize received signature
    let receivedSignature = signature.trim().toLowerCase()
    
    // Remove common prefixes
    const prefixes = ['sha256=', 'hmac-sha256=', 'casso-signature=', 'x-casso-signature=']
    for (const prefix of prefixes) {
      if (receivedSignature.startsWith(prefix)) {
        receivedSignature = receivedSignature.substring(prefix.length)
        console.log(`Removed prefix: ${prefix}`)
        break
      }
    }
    
    console.log('Normalized signature:', receivedSignature.substring(0, 20) + '...')
    
    // Compare signatures
    const hexMatch = expectedSignature === receivedSignature
    console.log('Hex signatures match:', hexMatch)
    
    if (hexMatch) {
      console.log('✅ CASSO signature verified (hex)')
      return true
    }
    
    // Try base64 encoding as fallback
    const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)))
    console.log('Trying base64 signature:', base64Signature.substring(0, 20) + '...')
    
    const base64Match = base64Signature === receivedSignature
    console.log('Base64 signatures match:', base64Match)
    
    if (base64Match) {
      console.log('✅ CASSO signature verified (base64)')
      return true
    }
    
    console.log('❌ CASSO signature verification failed - no format matched')
    return false
    
  } catch (error) {
    console.error('❌ Error in signature verification:', error)
    return false
  }
}
