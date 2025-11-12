
import { processAutomaticDelivery } from './deliveryService.ts'
import { sendPaymentConfirmationEmail, sendSellerNotificationEmail } from './emailService.ts'

export async function updateOrderStatus(order: any, transaction: any, transactionId: string, supabase: any) {
  console.log(`🔄 Updating order ${order.id} to paid status...`)
  
  const { data: updateData, error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      delivery_status: 'processing',
      payment_verified_at: new Date().toISOString(),
      bank_transaction_id: transactionId,
      bank_amount: transaction.amount,
      casso_transaction_id: transactionId,
      updated_at: new Date().toISOString()
    })
    .eq('id', order.id)
    .select('*')

  if (updateError) {
    console.error('❌ Error updating order:', updateError)
    throw new Error(`Failed to update order: ${updateError.message}`)
  }

  console.log(`✅ Order updated successfully`)
  return updateData
}

export async function processOrderCompletion(order: any, transaction: any, transactionId: string, supabase: any) {
  // Process automatic delivery
  console.log(`📦 Processing automatic delivery...`)
  const deliveryResult = await processAutomaticDelivery(order, supabase)
  
  // Increment voucher usage if applicable
  await incrementVoucherUsage(order, supabase)
  
  // Create notifications
  await createNotifications(order, deliveryResult, supabase)
  
  // Send emails (non-blocking)
  Promise.allSettled([
    sendPaymentConfirmationEmail(order),
    sendSellerNotificationEmail(order)
  ]).catch(error => console.error('Email error:', error))

  console.log(`🎉 Payment processing completed successfully`)
  
  return {
    transaction_id: transactionId,
    status: 'processed_successfully',
    order_id: order.id,
    amount: transaction.amount,
    delivery_status: deliveryResult.success ? 'auto_delivered' : 'manual_required',
    product_type: order.products?.product_type
  }
}

async function incrementVoucherUsage(order: any, supabase: any) {
  try {
    if (order.voucher_id) {
      console.log(`🎟️ Incrementing voucher usage for voucher ${order.voucher_id}`)
      
      const { error } = await supabase
        .from('vouchers')
        .update({ used_count: supabase.sql`used_count + 1` })
        .eq('id', order.voucher_id)
      
      if (error) {
        console.error('⚠️ Error incrementing voucher usage:', error)
      } else {
        console.log(`✅ Voucher usage incremented`)
      }
    }
  } catch (error) {
    console.error('⚠️ Voucher increment error:', error)
  }
}

async function createNotifications(order: any, deliveryResult: any, supabase: any) {
  try {
    const notifications = [
      {
        user_id: order.user_id,
        title: 'Thanh toán thành công',
        message: `Đơn hàng "${order.products?.title}" đã được thanh toán và ${deliveryResult.success ? 'giao hàng tự động' : 'đang được xử lý'}.`,
        type: 'payment_success',
        related_order_id: order.id
      },
      {
        user_id: order.products?.seller_id,
        title: 'Đơn hàng mới được thanh toán',
        message: `Đơn hàng "${order.products?.title}" đã được thanh toán thành công. ${deliveryResult.success ? 'Đã giao hàng tự động.' : 'Cần xử lý giao hàng thủ công.'}`,
        type: 'new_order',
        related_order_id: order.id
      }
    ]

    const { error } = await supabase
      .from('notifications')
      .insert(notifications)

    if (error) {
      console.error('⚠️ Error creating notifications:', error)
    } else {
      console.log(`✅ Notifications created`)
    }
  } catch (error) {
    console.error('⚠️ Notification creation error:', error)
  }
}
