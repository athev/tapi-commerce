
import { SepayWebhookPayload } from './types.ts'

export function validatePayload(payload: SepayWebhookPayload): { isValid: boolean; error?: string } {
  console.log('🔍 [SEPAY] Validating payload structure...')
  
  // Kiểm tra các trường bắt buộc
  if (!payload.id || typeof payload.id !== 'number') {
    console.error('❌ [SEPAY] Missing or invalid transaction ID')
    return { isValid: false, error: 'Missing or invalid transaction ID' }
  }

  if (!payload.transferAmount || typeof payload.transferAmount !== 'number') {
    console.error('❌ [SEPAY] Missing or invalid transfer amount')
    return { isValid: false, error: 'Missing or invalid transfer amount' }
  }

  if (!payload.content || typeof payload.content !== 'string') {
    console.error('❌ [SEPAY] Missing or invalid transaction content')
    return { isValid: false, error: 'Missing or invalid transaction content' }
  }

  if (!payload.transactionDate) {
    console.error('❌ [SEPAY] Missing transaction date')
    return { isValid: false, error: 'Missing transaction date' }
  }

  // Chỉ xử lý giao dịch tiền vào
  if (payload.transferType !== 'in') {
    console.log('⚠️ [SEPAY] Transaction is not incoming transfer, skipping')
    return { isValid: false, error: 'Only process incoming transfers' }
  }

  console.log('✅ [SEPAY] Payload validation passed')
  return { isValid: true }
}

export function isTestWebhook(payload: SepayWebhookPayload): boolean {
  const isTest = payload.id === 0 || 
                 payload.content?.toLowerCase().includes('test') ||
                 payload.content?.toLowerCase().includes('tes')

  if (isTest) {
    console.log('🧪 [SEPAY] Test webhook detected')
  }
  
  return isTest
}
