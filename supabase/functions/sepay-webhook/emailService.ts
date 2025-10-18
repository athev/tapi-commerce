
export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export async function sendPaymentConfirmationEmail(order: any): Promise<boolean> {
  try {
    console.log(`📧 Sending payment confirmation email to: ${order.buyer_email}`);
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Xác nhận thanh toán thành công</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .success-icon { font-size: 48px; color: #4CAF50; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1>Thanh toán thành công!</h1>
          </div>
          
          <div class="content">
            <h2>Chào bạn,</h2>
            <p>Chúng tôi đã nhận được thanh toán cho đơn hàng của bạn. Dưới đây là thông tin chi tiết:</p>
            
            <div class="order-details">
              <h3>Thông tin đơn hàng:</h3>
              <p><strong>Mã đơn hàng:</strong> ${order.id}</p>
              <p><strong>Sản phẩm:</strong> ${order.products?.title}</p>
              <p><strong>Giá:</strong> ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.products?.price)}</p>
              <p><strong>Thời gian thanh toán:</strong> ${new Date().toLocaleString('vi-VN')}</p>
            </div>
            
            <p><strong>Trạng thái:</strong> ✅ Đã thanh toán và xác nhận thành công</p>
            
            ${order.products?.product_type === 'file_download' ? 
              '<p>🎁 <strong>Sản phẩm của bạn sẽ được gửi qua email trong vài phút tới.</strong></p>' :
              '<p>📞 <strong>Chúng tôi sẽ liên hệ với bạn để giao hàng trong thời gian sớm nhất.</strong></p>'
            }
            
            <p>Cảm ơn bạn đã tin tướng và mua sắm tại DigitalMarket!</p>
          </div>
          
          <div class="footer">
            <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            <p>Nếu có thắc mắc, hãy liên hệ với chúng tôi qua chat trên website.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Note: In a real implementation, you would integrate with an email service like SendGrid
    // For now, we'll just log the email content and return success
    console.log('📧 Email content prepared for:', order.buyer_email);
    console.log('📧 Email subject: Xác nhận thanh toán thành công - Đơn hàng', order.id.substring(0, 8));
    
    // TODO: Integrate with actual email service
    // await sendEmail({
    //   to: order.buyer_email,
    //   subject: `Xác nhận thanh toán thành công - Đơn hàng ${order.id.substring(0, 8)}`,
    //   html: emailHtml
    // });
    
    return true;
  } catch (error) {
    console.error('❌ Error sending payment confirmation email:', error);
    return false;
  }
}

export async function sendSellerNotificationEmail(order: any): Promise<boolean> {
  try {
    console.log(`📧 Sending seller notification for order: ${order.id}`);
    
    // Note: In a real implementation, get seller email from profiles table
    // For now, we'll just log the notification
    console.log('📧 Seller notification: New paid order received');
    console.log('📧 Order details:', {
      orderId: order.id,
      product: order.products?.title,
      amount: order.products?.price,
      buyerEmail: order.buyer_email
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error sending seller notification:', error);
    return false;
  }
}
