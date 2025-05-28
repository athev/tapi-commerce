
import { CassoWebhookPayload } from './types.ts'

export function validatePayload(payload: CassoWebhookPayload): { isValid: boolean; error?: string } {
  console.log('🔍 Validating payload structure...')
  
  if (payload.error && payload.error !== 0) {
    console.error('❌ CASSO webhook error:', payload.error)
    return { isValid: false, error: `CASSO webhook error: ${payload.error}` }
  }

  if (!payload.data || !Array.isArray(payload.data) || payload.data.length === 0) {
    console.error('❌ No transaction data in payload')
    return { isValid: false, error: 'No transaction data' }
  }

  console.log('✅ Payload validation passed')
  return { isValid: true }
}

export function isTestWebhook(payload: CassoWebhookPayload, signature?: string): boolean {
  const isTest = !signature || 
                 (payload.data && payload.data.length > 0 && payload.data[0].id === 0) ||
                 (payload.data && payload.data.length > 0 && payload.data[0].description?.includes('test'))

  if (isTest) {
    console.log('🧪 Test webhook detected')
  }
  
  return isTest
}
