
import { supabase } from "@/integrations/supabase/client";

export const fetchManualPaymentOrders = async () => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    // Check user roles from user_roles table for proper authorization
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.user?.id);
    
    const isAdmin = userRoles?.some(r => r.role === 'admin') || false;

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
    if (!isAdmin) {
      // First get products owned by this seller
      const { data: sellerProducts } = await supabase
        .from('products')
        .select('id')
        .eq('seller_id', currentUser.user?.id);
      
      if (!sellerProducts || sellerProducts.length === 0) {
        return [];
      }
      
      const productIds = sellerProducts.map(p => p.id);
      ordersQuery = ordersQuery.in('product_id', productIds);
    }
    
    const { data: ordersData, error: ordersError } = await ordersQuery;
    
    if (ordersError) {
      return [];
    }

    return ordersData || [];
  } catch (error) {
    return [];
  }
};

export const confirmManualPayment = async (orderId: string) => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    // Check user roles from user_roles table for proper authorization
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.user?.id);
    
    const isAdmin = userRoles?.some(r => r.role === 'admin') || false;

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
      throw fetchError;
    }

    if (!orderData) {
      throw new Error('Không tìm thấy thông tin đơn hàng');
    }

    const isProductOwner = orderData.products?.seller_id === currentUser.user?.id;

    if (!isAdmin && !isProductOwner) {
      throw new Error('Bạn không có quyền xác nhận đơn hàng này');
    }
    const updatePayload = { 
      status: 'paid',
      delivery_status: 'processing',
      payment_verified_at: new Date().toISOString(),
      manual_payment_requested: false,
      casso_transaction_id: `manual_${orderId.slice(0, 8)}_${Date.now()}`,
      updated_at: new Date().toISOString()
    };

    const { data: updateData, error: updateError } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select('*');

    if (updateError) {
      throw updateError;
    }

    if (!updateData || updateData.length === 0) {
      throw new Error('Không thể cập nhật đơn hàng - có thể do quyền truy cập');
    }
    
    // Increment product purchases count
    if (orderData.products?.id) {
      const { error: rpcError } = await supabase.rpc('increment_product_purchases', { 
        p_product_id: orderData.products.id 
      });
      
      if (rpcError) {
        console.error('Error incrementing purchases:', rpcError);
        // Fallback: manual increment
        const { data: product } = await supabase
          .from('products')
          .select('purchases, purchases_last_7_days, purchases_last_30_days')
          .eq('id', orderData.products.id)
          .single();
          
        if (product) {
          await supabase
            .from('products')
            .update({ 
              purchases: (product.purchases || 0) + 1,
              purchases_last_7_days: (product.purchases_last_7_days || 0) + 1,
              purchases_last_30_days: (product.purchases_last_30_days || 0) + 1
            })
            .eq('id', orderData.products.id);
        }
      }
    }
    
    await supabase
      .from('notifications')
      .insert({
        user_id: orderData.user_id,
        type: 'payment_confirmed',
        title: 'Thanh toán đã được xác nhận',
        message: `Người bán đã xác nhận thanh toán cho đơn hàng "${orderData.products.title}". Đơn hàng sẽ được xử lý ngay.`,
        related_order_id: orderId,
        is_read: false
      });

    if (isAdmin && orderData.products?.seller_id !== currentUser.user?.id) {
      await supabase
        .from('notifications')
        .insert({
          user_id: orderData.products.seller_id,
          type: 'new_paid_order',
          title: 'Đơn hàng đã được xác nhận thanh toán',
          message: `Đơn hàng "${orderData.products.title}" đã được xác nhận thanh toán thủ công và cần xử lý giao hàng.`,
          related_order_id: orderId,
          is_read: false
        });
    }

  } catch (error) {
    throw error;
  }
};

export const rejectManualPayment = async (orderId: string) => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    
    // Check user roles from user_roles table for proper authorization
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.user?.id);
    
    const isAdmin = userRoles?.some(r => r.role === 'admin') || false;

    const { data: orderData, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        products (title, seller_id)
      `)
      .eq('id', orderId)
      .single();

    if (fetchError || !orderData) {
      throw fetchError || new Error('Không tìm thấy thông tin đơn hàng');
    }

    const isProductOwner = orderData.products?.seller_id === currentUser.user?.id;
    
    if (!isAdmin && !isProductOwner) {
      throw new Error('Bạn không có quyền từ chối đơn hàng này');
    }

    const { data: updateData, error: updateError } = await supabase
      .from('orders')
      .update({ 
        manual_payment_requested: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select('*');
    
    if (updateError) {
      throw updateError;
    }

    await supabase
      .from('notifications')
      .insert({
        user_id: orderData.user_id,
        type: 'payment_rejected',
        title: 'Yêu cầu xác nhận thanh toán bị từ chối',
        message: `Yêu cầu xác nhận thanh toán cho đơn hàng "${orderData.products.title}" đã bị từ chối. Vui lòng kiểm tra lại thông tin chuyển khoản hoặc liên hệ hỗ trợ.`,
        related_order_id: orderId,
        is_read: false
      });

  } catch (error) {
    throw error;
  }
};
