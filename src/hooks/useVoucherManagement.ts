import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context';
import { toast } from 'sonner';

export interface VoucherFormData {
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  max_discount_amount?: number;
  min_purchase_amount: number;
  applicable_to: 'all' | 'specific_products' | 'specific_categories';
  product_ids?: string[];
  category_names?: string[];
  usage_limit?: number;
  valid_from: Date;
  valid_until: Date;
  is_active: boolean;
}

export const useVoucherManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: vouchers, isLoading } = useQuery({
    queryKey: ['seller-vouchers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createVoucher = useMutation({
    mutationFn: async (formData: VoucherFormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Create voucher
      const { data: voucher, error: voucherError } = await supabase
        .from('vouchers')
        .insert({
          code: formData.code.toUpperCase(),
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          max_discount_amount: formData.max_discount_amount,
          min_purchase_amount: formData.min_purchase_amount,
          applicable_to: formData.applicable_to,
          usage_limit: formData.usage_limit,
          valid_from: formData.valid_from.toISOString(),
          valid_until: formData.valid_until.toISOString(),
          is_active: formData.is_active,
          created_by: user.id,
        })
        .select()
        .single();

      if (voucherError) throw voucherError;

      // Create voucher_products if applicable
      if (formData.applicable_to === 'specific_products' && formData.product_ids?.length) {
        const products = formData.product_ids.map(product_id => ({
          voucher_id: voucher.id,
          product_id,
        }));

        const { error: productsError } = await supabase
          .from('voucher_products')
          .insert(products);

        if (productsError) throw productsError;
      }

      // Create voucher_categories if applicable
      if (formData.applicable_to === 'specific_categories' && formData.category_names?.length) {
        const categories = formData.category_names.map(category_name => ({
          voucher_id: voucher.id,
          category_name,
        }));

        const { error: categoriesError } = await supabase
          .from('voucher_categories')
          .insert(categories);

        if (categoriesError) throw categoriesError;
      }

      return voucher;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-vouchers'] });
      toast.success('Tạo mã giảm giá thành công');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể tạo mã giảm giá');
    },
  });

  const updateVoucher = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: VoucherFormData }) => {
      // Update voucher
      const { data: voucher, error: voucherError } = await supabase
        .from('vouchers')
        .update({
          code: formData.code.toUpperCase(),
          discount_type: formData.discount_type,
          discount_value: formData.discount_value,
          max_discount_amount: formData.max_discount_amount,
          min_purchase_amount: formData.min_purchase_amount,
          applicable_to: formData.applicable_to,
          usage_limit: formData.usage_limit,
          valid_from: formData.valid_from.toISOString(),
          valid_until: formData.valid_until.toISOString(),
          is_active: formData.is_active,
        })
        .eq('id', id)
        .select()
        .single();

      if (voucherError) throw voucherError;

      // Delete existing relations
      await supabase.from('voucher_products').delete().eq('voucher_id', id);
      await supabase.from('voucher_categories').delete().eq('voucher_id', id);

      // Create new relations
      if (formData.applicable_to === 'specific_products' && formData.product_ids?.length) {
        const products = formData.product_ids.map(product_id => ({
          voucher_id: id,
          product_id,
        }));
        await supabase.from('voucher_products').insert(products);
      }

      if (formData.applicable_to === 'specific_categories' && formData.category_names?.length) {
        const categories = formData.category_names.map(category_name => ({
          voucher_id: id,
          category_name,
        }));
        await supabase.from('voucher_categories').insert(categories);
      }

      return voucher;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-vouchers'] });
      toast.success('Cập nhật mã giảm giá thành công');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể cập nhật mã giảm giá');
    },
  });

  const deleteVoucher = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vouchers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-vouchers'] });
      toast.success('Xóa mã giảm giá thành công');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể xóa mã giảm giá');
    },
  });

  const toggleVoucherStatus = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('vouchers')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-vouchers'] });
      toast.success('Cập nhật trạng thái thành công');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể cập nhật trạng thái');
    },
  });

  return {
    vouchers: vouchers || [],
    isLoading,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    toggleVoucherStatus,
  };
};
