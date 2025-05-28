
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
  console.log('Starting manual payment confirmation for order:', orderId);
  
  try {
    // Lấy thông tin đơn hàng trước khi cập nhật
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

    if (fetchError || !orderData) {
      console.error('Error fetching order data:', fetchError);
      throw fetchError || new Error('Không tìm thấy thông tin đơn hàng');
    }

    console.log('Order data before update:', orderData);

    // Sử dụng RPC function để bypass RLS nếu cần
    const { data: updateResult, error: updateError } = await supabase.rpc('admin_confirm_manual_payment', {
      order_id: orderId
    });

    if (updateError) {
      console.error('RPC function failed, trying direct update:', updateError);
      
      // Fallback: thử update trực tiếp
      const { data: directUpdateData, error: directUpdateError } = await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          delivery_status: 'pending',
          payment_verified_at: new Date().toISOString(),
          manual_payment_requested: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select('*');
      
      if (directUpdateError) {
        console.error('Direct update also failed:', directUpdateError);
        throw directUpdateError;
      }
      
      console.log('Direct update successful:', directUpdateData);
    } else {
      console.log('RPC update successful:', updateResult);
    }

    // Tạo thông báo cho người mua
    const { error: buyerNotificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: orderData.user_id,
        type: 'payment_confirmed',
        title: 'Thanh toán đã được xác nhận',
        message: `Đơn hàng "${orderData.products.title}" đã được xác nhận thanh toán thành công. Chúng tôi sẽ tiến hành giao hàng sớm nhất.`,
        related_order_id: orderId,
        is_read: false
      });

    if (buyerNotificationError) {
      console.error('Error creating buyer notification:', buyerNotificationError);
    } else {
      console.log('Buyer notification created successfully');
    }

    // Tạo thông báo cho seller về đơn hàng mới cần xử lý
    const { error: sellerNotificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: orderData.products.seller_id,
        type: 'new_paid_order',
        title: 'Đơn hàng mới cần xử lý',
        message: `Đơn hàng "${orderData.products.title}" đã được thanh toán và cần giao hàng. Vui lòng vào phần quản lý đơn hàng để xử lý.`,
        related_order_id: orderId,
        is_read: false
      });

    if (sellerNotificationError) {
      console.error('Error creating seller notification:', sellerNotificationError);
    } else {
      console.log('Seller notification created successfully');
    }

    // Thêm delay nhỏ để đảm bảo database được update
    await new Promise(resolve => setTimeout(resolve, 500));

  } catch (error) {
    console.error('Error in confirmManualPayment:', error);
    throw error;
  }
};

export const rejectManualPayment = async (orderId: string) => {
  console.log('Starting manual payment rejection for order:', orderId);
  
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
      console.error('Error fetching order data:', fetchError);
      throw fetchError || new Error('Không tìm thấy thông tin đơn hàng');
    }

    console.log('Order data before rejection:', orderData);

    // Cập nhật đơn hàng
    const { data: updateData, error: updateError } = await supabase
      .from('orders')
      .update({ 
        manual_payment_requested: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select('*');
    
    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    console.log('Order rejection updated successfully:', updateData);

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
      console.error('Error creating rejection notification:', notificationError);
    } else {
      console.log('Rejection notification created successfully');
    }

    // Thêm delay nhỏ để đảm bảo database được update
    await new Promise(resolve => setTimeout(resolve, 500));

  } catch (error) {
    console.error('Error in rejectManualPayment:', error);
    throw error;
  }
};
