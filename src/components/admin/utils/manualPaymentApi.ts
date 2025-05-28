
import { supabase } from "@/integrations/supabase/client";

export const fetchManualPaymentOrders = async () => {
  try {
    console.log('Fetching manual payment orders...');
    
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        products (
          id,
          title,
          price,
          image,
          seller_id,
          seller_name
        )
      `)
      .eq('manual_payment_requested', true)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      console.error('Manual orders fetch error:', ordersError);
      return [];
    }

    console.log('Manual payment orders:', ordersData);
    return ordersData || [];
  } catch (error) {
    console.error('Error fetching manual payment orders:', error);
    return [];
  }
};

export const confirmManualPayment = async (orderId: string) => {
  console.log('🔄 Starting manual payment confirmation for order:', orderId);
  console.log('🔄 Order ID type:', typeof orderId, 'Length:', orderId.length);
  
  try {
    // STEP 1: Verify order exists and get current state
    console.log('📋 STEP 1: Fetching current order state...');
    const { data: orderData, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        products (
          id,
          title,
          price,
          seller_id,
          product_type
        )
      `)
      .eq('id', orderId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching order data:', fetchError);
      throw fetchError;
    }

    if (!orderData) {
      console.error('❌ Order not found with ID:', orderId);
      throw new Error('Không tìm thấy thông tin đơn hàng');
    }

    console.log('📋 Current order data before update:', {
      id: orderData.id,
      status: orderData.status,
      manual_payment_requested: orderData.manual_payment_requested,
      delivery_status: orderData.delivery_status,
      payment_verified_at: orderData.payment_verified_at
    });

    // STEP 2: Prepare update payload with detailed logging
    const updatePayload = { 
      status: 'paid',
      delivery_status: 'processing',
      payment_verified_at: new Date().toISOString(),
      manual_payment_requested: false,
      casso_transaction_id: `manual_${orderId.slice(0, 8)}_${Date.now()}`,
      updated_at: new Date().toISOString()
    };

    console.log('📝 STEP 2: Update payload prepared:', updatePayload);
    console.log('📝 Attempting update with conditions: id =', orderId);

    // STEP 3: Execute update with detailed result logging
    const { data: updateData, error: updateError, count } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select('*');
    
    console.log('📊 STEP 3: Update execution results:');
    console.log('- Error:', updateError);
    console.log('- Data returned:', updateData);
    console.log('- Count:', count);
    console.log('- Data length:', updateData?.length);

    if (updateError) {
      console.error('❌ Supabase update error:', updateError);
      throw updateError;
    }

    // STEP 4: Verify update success
    if (!updateData || updateData.length === 0) {
      console.error('⚠️ No rows were updated - investigating...');
      
      // Check if order still exists
      const { data: checkOrder, error: checkError } = await supabase
        .from('orders')
        .select('id, status, manual_payment_requested, delivery_status')
        .eq('id', orderId)
        .single();
      
      console.log('🔍 Order verification after failed update:');
      console.log('- Check error:', checkError);
      console.log('- Order still exists:', checkOrder);
      
      if (checkError) {
        console.error('❌ Order verification failed:', checkError);
        throw new Error('Đơn hàng không tồn tại hoặc không thể truy cập');
      }
      
      // Try a more direct update approach
      console.log('🔄 Attempting direct update without conditions...');
      const { data: directUpdate, error: directError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          delivery_status: 'processing',
          payment_verified_at: new Date().toISOString(),
          manual_payment_requested: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select('*');
      
      console.log('🔄 Direct update results:', { directUpdate, directError });
      
      if (directError) {
        console.error('❌ Direct update also failed:', directError);
        throw directError;
      }
      
      if (!directUpdate || directUpdate.length === 0) {
        throw new Error('Không thể cập nhật đơn hàng - có thể do quyền truy cập');
      }
      
      console.log('✅ Direct update successful:', directUpdate[0]);
      // Use direct update data for notifications
      updateData[0] = directUpdate[0];
    } else {
      console.log('✅ Standard update successful:', updateData[0]);
    }

    // STEP 5: Create notifications
    console.log('📧 STEP 5: Creating notifications...');
    
    // Buyer notification
    const { error: buyerNotificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: orderData.user_id,
        type: 'payment_confirmed',
        title: 'Thanh toán đã được xác nhận',
        message: `Người bán đã xác nhận thanh toán cho đơn hàng "${orderData.products.title}". Đơn hàng sẽ được xử lý ngay.`,
        related_order_id: orderId,
        is_read: false
      });

    if (buyerNotificationError) {
      console.error('⚠️ Error creating buyer notification:', buyerNotificationError);
    } else {
      console.log('✅ Buyer notification created successfully');
    }

    // Seller notification
    const { error: sellerNotificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: orderData.products.seller_id,
        type: 'new_paid_order',
        title: 'Đơn hàng đã được xác nhận thanh toán',
        message: `Đơn hàng "${orderData.products.title}" đã được xác nhận thanh toán thủ công và cần xử lý giao hàng.`,
        related_order_id: orderId,
        is_read: false
      });

    if (sellerNotificationError) {
      console.error('⚠️ Error creating seller notification:', sellerNotificationError);
    } else {
      console.log('✅ Seller notification created successfully');
    }

    // STEP 6: Final verification
    const { data: finalCheck, error: finalError } = await supabase
      .from('orders')
      .select('id, status, delivery_status, payment_verified_at, manual_payment_requested')
      .eq('id', orderId)
      .single();
    
    console.log('🔍 STEP 6: Final verification:', { finalCheck, finalError });

    if (finalCheck) {
      console.log('✅ Manual payment confirmation completed successfully');
      console.log('📊 Final order state:', finalCheck);
    }

  } catch (error) {
    console.error('❌ Error in confirmManualPayment:', error);
    throw error;
  }
};

export const rejectManualPayment = async (orderId: string) => {
  console.log('🔄 Starting manual payment rejection for order:', orderId);
  
  try {
    // Lấy thông tin đơn hàng
    const { data: orderData, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        products (title)
      `)
      .eq('id', orderId)
      .single();

    if (fetchError || !orderData) {
      console.error('❌ Error fetching order data:', fetchError);
      throw fetchError || new Error('Không tìm thấy thông tin đơn hàng');
    }

    console.log('📋 Order data before rejection:', orderData);

    // Cập nhật đơn hàng - chỉ tắt manual_payment_requested
    const { data: updateData, error: updateError } = await supabase
      .from('orders')
      .update({ 
        manual_payment_requested: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select('*');
    
    if (updateError) {
      console.error('❌ Error updating order:', updateError);
      throw updateError;
    }

    console.log('✅ Order rejection updated successfully:', updateData);

    // Thông báo cho người mua
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: orderData.user_id,
        type: 'payment_rejected',
        title: 'Yêu cầu xác nhận thanh toán bị từ chối',
        message: `Yêu cầu xác nhận thanh toán cho đơn hàng "${orderData.products.title}" đã bị từ chối. Vui lòng kiểm tra lại thông tin chuyển khoản hoặc liên hệ hỗ trợ.`,
        related_order_id: orderId,
        is_read: false
      });

    if (notificationError) {
      console.error('⚠️ Error creating rejection notification:', notificationError);
    } else {
      console.log('✅ Rejection notification created successfully');
    }

  } catch (error) {
    console.error('❌ Error in rejectManualPayment:', error);
    throw error;
  }
};
