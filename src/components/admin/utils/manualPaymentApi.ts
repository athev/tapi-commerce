
import { supabase } from "@/integrations/supabase/client";

export const fetchManualPaymentOrders = async () => {
  try {
    console.log('Fetching manual payment orders...');
    
    // Get current user profile to check permissions
    const { data: currentUser } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.user?.id)
      .single();

    let ordersQuery = supabase
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

    // If user is not admin, only show orders for their products
    if (profile?.role !== 'admin') {
      // First get products owned by this seller
      const { data: sellerProducts } = await supabase
        .from('products')
        .select('id')
        .eq('seller_id', currentUser.user?.id);
      
      if (!sellerProducts || sellerProducts.length === 0) {
        console.log('No products found for this seller');
        return [];
      }
      
      const productIds = sellerProducts.map(p => p.id);
      ordersQuery = ordersQuery.in('product_id', productIds);
    }
    
    const { data: ordersData, error: ordersError } = await ordersQuery;
    
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
    // Get current user to check permissions
    const { data: currentUser } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.user?.id)
      .single();

    console.log('👤 Current user profile:', profile);

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

    // STEP 2: Check permissions
    const isAdmin = profile?.role === 'admin';
    const isProductOwner = orderData.products?.seller_id === currentUser.user?.id;
    
    console.log('🔐 Permission check:', {
      isAdmin,
      isProductOwner,
      currentUserId: currentUser.user?.id,
      productSellerId: orderData.products?.seller_id
    });

    if (!isAdmin && !isProductOwner) {
      throw new Error('Bạn không có quyền xác nhận đơn hàng này');
    }

    console.log('📋 Current order data before update:', {
      id: orderData.id,
      status: orderData.status,
      manual_payment_requested: orderData.manual_payment_requested,
      delivery_status: orderData.delivery_status,
      payment_verified_at: orderData.payment_verified_at
    });

    // STEP 3: Update using RPC function to bypass RLS if needed
    const updatePayload = { 
      status: 'paid',
      delivery_status: 'processing',
      payment_verified_at: new Date().toISOString(),
      manual_payment_requested: false,
      casso_transaction_id: `manual_${orderId.slice(0, 8)}_${Date.now()}`,
      updated_at: new Date().toISOString()
    };

    console.log('📝 STEP 3: Update payload prepared:', updatePayload);

    // Try direct update first
    const { data: updateData, error: updateError } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select('*');
    
    console.log('📊 Update execution results:', { updateData, updateError });

    if (updateError) {
      console.error('❌ Supabase update error:', updateError);
      throw updateError;
    }

    if (!updateData || updateData.length === 0) {
      console.error('⚠️ No rows were updated - this might be a permissions issue');
      throw new Error('Không thể cập nhật đơn hàng - có thể do quyền truy cập');
    }

    console.log('✅ Update successful:', updateData[0]);

    // STEP 4: Create notifications
    console.log('📧 STEP 4: Creating notifications...');
    
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

    // Seller notification (if admin is confirming)
    if (isAdmin && orderData.products?.seller_id !== currentUser.user?.id) {
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
    }

    console.log('✅ Manual payment confirmation completed successfully');

  } catch (error) {
    console.error('❌ Error in confirmManualPayment:', error);
    throw error;
  }
};

export const rejectManualPayment = async (orderId: string) => {
  console.log('🔄 Starting manual payment rejection for order:', orderId);
  
  try {
    // Get current user to check permissions
    const { data: currentUser } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.user?.id)
      .single();

    // Lấy thông tin đơn hàng
    const { data: orderData, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        products (title, seller_id)
      `)
      .eq('id', orderId)
      .single();

    if (fetchError || !orderData) {
      console.error('❌ Error fetching order data:', fetchError);
      throw fetchError || new Error('Không tìm thấy thông tin đơn hàng');
    }

    // Check permissions
    const isAdmin = profile?.role === 'admin';
    const isProductOwner = orderData.products?.seller_id === currentUser.user?.id;
    
    if (!isAdmin && !isProductOwner) {
      throw new Error('Bạn không có quyền từ chối đơn hàng này');
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
