import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/utils/priceUtils';

export const useVoucherValidation = () => {
  const [isValidating, setIsValidating] = useState(false);

  const validateVoucher = async (code: string, productId: string, orderAmount: number) => {
    setIsValidating(true);
    
    try {
      // 1. Fetch voucher by code
      const { data: voucher, error: voucherError } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (voucherError || !voucher) {
        return { valid: false, error: 'Mã không tồn tại' };
      }

      // 2. Check active
      if (!voucher.is_active) {
        return { valid: false, error: 'Mã đã bị vô hiệu hóa' };
      }

      // 3. Check validity period
      const now = new Date();
      const validFrom = new Date(voucher.valid_from);
      const validUntil = new Date(voucher.valid_until);

      if (now < validFrom) {
        return { valid: false, error: 'Mã chưa có hiệu lực' };
      }
      if (now > validUntil) {
        return { valid: false, error: 'Mã đã hết hạn' };
      }

      // 4. Check usage limit
      if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
        return { valid: false, error: 'Mã đã hết lượt sử dụng' };
      }

      // 5. Check min purchase
      if (orderAmount < voucher.min_purchase_amount) {
        return { 
          valid: false, 
          error: `Đơn tối thiểu ${formatPrice(voucher.min_purchase_amount)}` 
        };
      }

      // 6. Check applicable scope
      if (voucher.applicable_to === 'specific_products') {
        const { data: voucherProducts } = await supabase
          .from('voucher_products')
          .select('product_id')
          .eq('voucher_id', voucher.id);

        const productIds = voucherProducts?.map(vp => vp.product_id) || [];
        if (!productIds.includes(productId)) {
          return { valid: false, error: 'Mã không áp dụng cho sản phẩm này' };
        }
      }

      if (voucher.applicable_to === 'specific_categories') {
        const { data: product } = await supabase
          .from('products')
          .select('category')
          .eq('id', productId)
          .single();

        if (!product) {
          return { valid: false, error: 'Không tìm thấy sản phẩm' };
        }

        const { data: voucherCategories } = await supabase
          .from('voucher_categories')
          .select('category_name')
          .eq('voucher_id', voucher.id);

        const categoryNames = voucherCategories?.map(vc => vc.category_name) || [];
        if (!categoryNames.includes(product.category)) {
          return { valid: false, error: 'Mã không áp dụng cho danh mục này' };
        }
      }

      return { valid: true, voucher };
    } catch (error) {
      console.error('Error validating voucher:', error);
      return { valid: false, error: 'Có lỗi xảy ra khi kiểm tra mã' };
    } finally {
      setIsValidating(false);
    }
  };

  const calculateDiscount = (voucher: any, orderAmount: number): number => {
    if (voucher.discount_type === 'fixed_amount') {
      return Math.min(voucher.discount_value, orderAmount);
    }

    // Percentage
    let discount = Math.floor((orderAmount * voucher.discount_value) / 100);

    // Apply max discount if set
    if (voucher.max_discount_amount) {
      discount = Math.min(discount, voucher.max_discount_amount);
    }

    return discount;
  };

  const applyVoucher = async (orderId: string, voucherId: string, discountAmount: number) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          voucher_id: voucherId,
          discount_amount: discountAmount,
        })
        .eq('id', orderId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error applying voucher:', error);
      return { success: false, error: 'Không thể áp dụng mã giảm giá' };
    }
  };

  return {
    isValidating,
    validateVoucher,
    calculateDiscount,
    applyVoucher,
  };
};
