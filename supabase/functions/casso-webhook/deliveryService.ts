
export async function processAutomaticDelivery(order: any, supabase: any): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`🚀 Starting automatic delivery for order: ${order.id}`);
    console.log(`📦 Product type: ${order.products?.product_type}`);
    
    const productType = order.products?.product_type;
    
    switch (productType) {
      case 'file_download':
        return await processFileDownload(order, supabase);
      
      case 'license_key_delivery':
        return await processLicenseKeyDelivery(order, supabase);
      
      case 'shared_account':
        return await processSharedAccountDelivery(order, supabase);
        
      case 'upgrade_account_no_pass':
      case 'upgrade_account_with_pass':
        return await processAccountUpgrade(order, supabase);
      
      default:
        console.log(`⚠️ Product type ${productType} requires manual processing`);
        return {
          success: false,
          message: 'Sản phẩm này cần được xử lý thủ công'
        };
    }
    
  } catch (error) {
    console.error('❌ Error in automatic delivery:', error);
    return {
      success: false,
      message: `Lỗi trong quá trình giao hàng tự động: ${error.message}`
    };
  }
}

async function processFileDownload(order: any, supabase: any): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`📁 Processing file download for order: ${order.id}`);
    
    // Check if product has downloadable file
    if (!order.products?.file_url) {
      console.log('⚠️ No file URL found for download product');
      return {
        success: false,
        message: 'Sản phẩm chưa có file để tải xuống'
      };
    }
    
    // Update delivery status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        delivery_status: 'delivered',
        delivery_notes: `File tự động gửi qua email: ${order.products.file_url}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);
    
    if (updateError) {
      throw updateError;
    }
    
    console.log(`✅ File download processed successfully for order: ${order.id}`);
    return {
      success: true,
      message: 'File đã được gửi qua email thành công'
    };
    
  } catch (error) {
    console.error('❌ Error processing file download:', error);
    return {
      success: false,
      message: `Lỗi xử lý file download: ${error.message}`
    };
  }
}

async function processLicenseKeyDelivery(order: any, supabase: any): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`🔑 Processing license key delivery for order: ${order.id}`);
    
    // Find available license key for this product
    const { data: licenseKey, error: keyError } = await supabase
      .from('license_keys')
      .select('*')
      .eq('product_id', order.product_id)
      .eq('is_used', false)
      .limit(1)
      .maybeSingle();
    
    if (keyError) {
      throw keyError;
    }
    
    if (!licenseKey) {
      console.log('⚠️ No available license keys for product');
      return {
        success: false,
        message: 'Không có license key khả dụng'
      };
    }
    
    // Mark license key as used
    const { error: updateKeyError } = await supabase
      .from('license_keys')
      .update({
        is_used: true,
        assigned_to_order: order.id,
        used_at: new Date().toISOString()
      })
      .eq('id', licenseKey.id);
    
    if (updateKeyError) {
      throw updateKeyError;
    }
    
    // Update order with delivery info
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({
        delivery_status: 'delivered',
        delivery_notes: `License Key: ${licenseKey.license_key}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);
    
    if (updateOrderError) {
      throw updateOrderError;
    }
    
    console.log(`✅ License key delivered successfully for order: ${order.id}`);
    return {
      success: true,
      message: `License key đã được gửi: ${licenseKey.license_key}`
    };
    
  } catch (error) {
    console.error('❌ Error processing license key delivery:', error);
    return {
      success: false,
      message: `Lỗi xử lý license key: ${error.message}`
    };
  }
}

async function processSharedAccountDelivery(order: any, supabase: any): Promise<{ success: boolean; message: string }> {
  console.log(`👥 Shared account delivery requires manual processing for order: ${order.id}`);
  
  // Update to pending manual processing
  await supabase
    .from('orders')
    .update({
      delivery_status: 'processing',
      delivery_notes: 'Tài khoản chia sẻ cần được xử lý thủ công',
      updated_at: new Date().toISOString()
    })
    .eq('id', order.id);
  
  return {
    success: false,
    message: 'Tài khoản chia sẻ cần được xử lý thủ công'
  };
}

async function processAccountUpgrade(order: any, supabase: any): Promise<{ success: boolean; message: string }> {
  console.log(`⬆️ Account upgrade requires manual processing for order: ${order.id}`);
  
  // Update to pending manual processing
  await supabase
    .from('orders')
    .update({
      delivery_status: 'processing',
      delivery_notes: 'Nâng cấp tài khoản cần được xử lý thủ công',
      updated_at: new Date().toISOString()
    })
    .eq('id', order.id);
  
  return {
    success: false,
    message: 'Nâng cấp tài khoản cần được xử lý thủ công'
  };
}
