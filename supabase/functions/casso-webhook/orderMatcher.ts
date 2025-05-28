
import { extractOrderId, isOrderMatch } from './orderUtils.ts'

export async function findMatchingOrder(extractedId: string, supabase: any) {
  console.log(`🔍 Searching for order with ID patterns...`)
  
  // Try exact UUID match first
  if (extractedId.includes('-') && extractedId.length === 36) {
    const { data: exactOrder } = await supabase
      .from('orders')
      .select(`
        id, status, user_id, product_id, buyer_email, created_at,
        products (id, title, price, seller_id, product_type, file_url)
      `)
      .eq('id', extractedId)
      .eq('status', 'pending')
      .is('payment_verified_at', null)
      .maybeSingle()
    
    if (exactOrder) {
      console.log(`✅ Found by exact UUID match`)
      return exactOrder
    }
  }
  
  // Try flexible matching with pending orders
  const { data: pendingOrders } = await supabase
    .from('orders')
    .select(`
      id, status, user_id, product_id, buyer_email, created_at,
      products (id, title, price, seller_id, product_type, file_url)
    `)
    .eq('status', 'pending')
    .is('payment_verified_at', null)
    .order('created_at', { ascending: false })
    .limit(50)
  
  // Check each order for flexible match
  for (const order of pendingOrders || []) {
    if (isOrderMatch(order.id, extractedId)) {
      console.log(`✅ Found by flexible match: ${order.id}`)
      return order
    }
  }
  
  return null
}

export function verifyPaymentAmount(transaction: any, order: any) {
  const expectedAmount = order.products?.price || 0
  const amountDifference = Math.abs(transaction.amount - expectedAmount)
  const tolerance = Math.max(1000, expectedAmount * 0.01) // 1% tolerance or 1000 VND minimum
  
  const isValid = amountDifference <= tolerance
  
  if (isValid) {
    console.log(`✅ Amount verified: ${transaction.amount} ≈ ${expectedAmount}`)
  } else {
    console.log(`❌ Amount mismatch: expected ${expectedAmount}, got ${transaction.amount}`)
  }
  
  return {
    isValid,
    expectedAmount,
    receivedAmount: transaction.amount,
    difference: amountDifference
  }
}
