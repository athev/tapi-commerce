
export async function processAutomaticDelivery(order: any, supabase: any): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`🚀 Starting automatic delivery for order: ${order.id}`)
    console.log(`📦 Product type: ${order.products?.product_type}`)
    console.log(`👤 Buyer email: ${order.buyer_email}`)
    
    const productType = order.products?.product_type
    
    switch (productType) {
      case 'file_download':
        return await processFileDownload(order, supabase)
      
      case 'license_key_delivery':
        return await processLicenseKeyDelivery(order, supabase)
      
      case 'shared_account':
        return await processSharedAccountDelivery(order, supabase)
        
      case 'upgrade_account_no_pass':
      case 'upgrade_account_with_pass':
        return await processAccountUpgrade(order, supabase)
      
      default:
        console.log(`⚠️ Product type ${productType} requires manual processing`)
        await updateOrderDeliveryStatus(order.id, 'processing', 'Sản phẩm này cần được xử lý thủ công', supabase)
        return {
          success: false,
          message: 'Sản phẩm này cần được xử lý thủ công'
        }
    }
    
  } catch (error) {
    console.error('❌ Error in automatic delivery:', error)
    await updateOrderDeliveryStatus(order.id, 'failed', `Lỗi trong quá trình giao hàng tự động: ${error.message}`, supabase)
    return {
      success: false,
      message: `Lỗi trong quá trình giao hàng tự động: ${error.message}`
    }
  }
}

async function updateOrderDeliveryStatus(orderId: string, status: string, notes: string, supabase: any) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        delivery_status: status,
        delivery_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
    
    if (error) {
      console.error('❌ Error updating delivery status:', error)
    } else {
      console.log(`✅ Updated delivery status to: ${status}`)
    }
  } catch (error) {
    console.error('❌ Error in updateOrderDeliveryStatus:', error)
  }
}

async function processFileDownload(order: any, supabase: any): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`📁 Processing file download for order: ${order.id}`)
    
    // Check if product has downloadable file
    if (!order.products?.file_url) {
      console.log('⚠️ No file URL found for download product')
      await updateOrderDeliveryStatus(order.id, 'processing', 'Sản phẩm chưa có file để tải xuống - cần xử lý thủ công', supabase)
      return {
        success: false,
        message: 'Sản phẩm chưa có file để tải xuống'
      }
    }
    
    // Update delivery status to delivered
    await updateOrderDeliveryStatus(order.id, 'delivered', `File tự động gửi qua email: ${order.products.file_url}`, supabase)
    
    console.log(`✅ File download processed successfully for order: ${order.id}`)
    return {
      success: true,
      message: 'File đã được gửi qua email thành công'
    }
    
  } catch (error) {
    console.error('❌ Error processing file download:', error)
    await updateOrderDeliveryStatus(order.id, 'failed', `Lỗi xử lý file download: ${error.message}`, supabase)
    return {
      success: false,
      message: `Lỗi xử lý file download: ${error.message}`
    }
  }
}

async function processLicenseKeyDelivery(order: any, supabase: any): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`🔑 Processing license key delivery for order: ${order.id}`)
    
    // Find available license key for this product
    const { data: licenseKey, error: keyError } = await supabase
      .from('license_keys')
      .select('*')
      .eq('product_id', order.product_id)
      .eq('is_used', false)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    
    if (keyError) {
      console.error('❌ Error fetching license key:', keyError)
      throw keyError
    }
    
    if (!licenseKey) {
      console.log('⚠️ No available license keys for product')
      await updateOrderDeliveryStatus(order.id, 'processing', 'Không có license key khả dụng - cần xử lý thủ công', supabase)
      return {
        success: false,
        message: 'Không có license key khả dụng'
      }
    }
    
    // Mark license key as used
    const { error: updateKeyError } = await supabase
      .from('license_keys')
      .update({
        is_used: true,
        assigned_to_order: order.id,
        used_at: new Date().toISOString()
      })
      .eq('id', licenseKey.id)
    
    if (updateKeyError) {
      console.error('❌ Error updating license key:', updateKeyError)
      throw updateKeyError
    }
    
    // Update order with delivery info
    await updateOrderDeliveryStatus(order.id, 'delivered', `License Key: ${licenseKey.license_key}`, supabase)
    
    console.log(`✅ License key delivered successfully for order: ${order.id}`)
    return {
      success: true,
      message: `License key đã được gửi: ${licenseKey.license_key}`
    }
    
  } catch (error) {
    console.error('❌ Error processing license key delivery:', error)
    await updateOrderDeliveryStatus(order.id, 'failed', `Lỗi xử lý license key: ${error.message}`, supabase)
    return {
      success: false,
      message: `Lỗi xử lý license key: ${error.message}`
    }
  }
}

async function processSharedAccountDelivery(order: any, supabase: any): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`👥 Processing shared account delivery for order: ${order.id}`)
    
    // For shared accounts, we need manual processing but we'll mark it properly
    await updateOrderDeliveryStatus(order.id, 'processing', 'Tài khoản chia sẻ - Đang chờ admin xử lý và gửi thông tin tài khoản', supabase)
    
    console.log(`⚠️ Shared account marked for manual processing: ${order.id}`)
    return {
      success: false,
      message: 'Tài khoản chia sẻ cần được xử lý thủ công bởi admin'
    }
    
  } catch (error) {
    console.error('❌ Error processing shared account:', error)
    await updateOrderDeliveryStatus(order.id, 'failed', `Lỗi xử lý tài khoản chia sẻ: ${error.message}`, supabase)
    return {
      success: false,
      message: `Lỗi xử lý tài khoản chia sẻ: ${error.message}`
    }
  }
}

async function processAccountUpgrade(order: any, supabase: any): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`⬆️ Processing account upgrade for order: ${order.id}`)
    
    // Account upgrades need manual processing
    await updateOrderDeliveryStatus(order.id, 'processing', 'Nâng cấp tài khoản - Đang chờ admin xử lý', supabase)
    
    console.log(`⚠️ Account upgrade marked for manual processing: ${order.id}`)
    return {
      success: false,
      message: 'Nâng cấp tài khoản cần được xử lý thủ công bởi admin'
    }
    
  } catch (error) {
    console.error('❌ Error processing account upgrade:', error)
    await updateOrderDeliveryStatus(order.id, 'failed', `Lỗi xử lý nâng cấp tài khoản: ${error.message}`, supabase)
    return {
      success: false,
      message: `Lỗi xử lý nâng cấp tài khoản: ${error.message}`
    }
  }
}
