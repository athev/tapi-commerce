
// Hàm verify CASSO signature theo HMAC-SHA256
export async function verifyCassoSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  if (!signature || !secret) {
    console.error('Missing signature or secret for verification')
    return false
  }

  try {
    console.log('=== SIGNATURE VERIFICATION START ===')
    console.log('Payload:', payload)
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
    
    // Thử nhiều format signature khác nhau
    const expectedHex = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    const expectedBase64 = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)))
    const expectedBase64Url = expectedBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    
    console.log('Expected hex:', expectedHex)
    console.log('Expected base64:', expectedBase64)
    console.log('Expected base64url:', expectedBase64Url)
    
    // Normalize received signature
    let receivedSignature = signature.trim()
    
    // Remove various prefixes
    const prefixesToRemove = [
      'sha256=',
      'hmac-sha256=', 
      'casso-signature=',
      'Bearer ',
      't=',
    ]
    
    for (const prefix of prefixesToRemove) {
      if (receivedSignature.toLowerCase().startsWith(prefix.toLowerCase())) {
        receivedSignature = receivedSignature.substring(prefix.length)
        console.log(`Removed prefix "${prefix}":`, receivedSignature)
      }
    }
    
    // Remove timestamp if present (format: t=timestamp,v1=signature)
    if (receivedSignature.includes(',v1=')) {
      receivedSignature = receivedSignature.split(',v1=')[1]
      console.log('Extracted from timestamp format:', receivedSignature)
    }
    
    receivedSignature = receivedSignature.trim()
    console.log('Final received signature:', receivedSignature)
    
    // Thử so sánh với các format khác nhau
    const comparisons = [
      { name: 'hex lowercase', expected: expectedHex.toLowerCase(), received: receivedSignature.toLowerCase() },
      { name: 'hex uppercase', expected: expectedHex.toUpperCase(), received: receivedSignature.toUpperCase() },
      { name: 'base64', expected: expectedBase64, received: receivedSignature },
      { name: 'base64url', expected: expectedBase64Url, received: receivedSignature },
    ]
    
    for (const comparison of comparisons) {
      console.log(`Comparing ${comparison.name}:`)
      console.log(`  Expected: ${comparison.expected}`)
      console.log(`  Received: ${comparison.received}`)
      console.log(`  Match: ${comparison.expected === comparison.received}`)
      
      if (comparison.expected === comparison.received) {
        console.log(`✅ Signature verified with ${comparison.name} format`)
        return true
      }
    }
    
    // Thử với payload được normalize khác nhau
    const payloadVariations = [
      payload,
      payload.replace(/\r\n/g, '\n'),
      payload.replace(/\n/g, '\r\n'),
      payload.replace(/\s+/g, ' ').trim(),
    ]
    
    for (let i = 0; i < payloadVariations.length; i++) {
      const testPayload = payloadVariations[i]
      if (testPayload === payload) continue
      
      console.log(`Testing payload variation ${i + 1}:`)
      const testSignatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(testPayload))
      const testHex = Array.from(new Uint8Array(testSignatureBytes))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      
      if (testHex.toLowerCase() === receivedSignature.toLowerCase()) {
        console.log(`✅ Signature verified with payload variation ${i + 1}`)
        return true
      }
    }
    
    console.log('❌ All signature verification attempts failed')
    console.log('=== SIGNATURE VERIFICATION END ===')
    
    return false
  } catch (error) {
    console.error('Error verifying CASSO signature:', error)
    return false
  }
}
