import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context';

export const useVoucherAnalytics = () => {
  const { user } = useAuth();

  const { data: summary } = useQuery({
    queryKey: ['voucher-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: vouchers } = await supabase
        .from('vouchers')
        .select('id, is_active, used_count')
        .eq('created_by', user.id);

      const totalVouchers = vouchers?.length || 0;
      const activeVouchers = vouchers?.filter(v => v.is_active).length || 0;
      const totalUsage = vouchers?.reduce((sum, v) => sum + (v.used_count || 0), 0) || 0;

      // Get total discount amount
      const voucherIds = vouchers?.map(v => v.id) || [];
      const { data: orders } = await supabase
        .from('orders')
        .select('discount_amount')
        .in('voucher_id', voucherIds);

      const totalDiscount = orders?.reduce((sum, o) => sum + (o.discount_amount || 0), 0) || 0;

      return {
        totalVouchers,
        activeVouchers,
        totalUsage,
        totalDiscount,
      };
    },
    enabled: !!user?.id,
  });

  const { data: topVouchers } = useQuery({
    queryKey: ['top-vouchers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: vouchers } = await supabase
        .from('vouchers')
        .select('id, code, used_count')
        .eq('created_by', user.id)
        .order('used_count', { ascending: false })
        .limit(10);

      if (!vouchers?.length) return [];

      // Get order stats for each voucher
      const voucherStats = await Promise.all(
        vouchers.map(async (voucher) => {
          const { data: orders } = await supabase
            .from('orders')
            .select('bank_amount, discount_amount')
            .eq('voucher_id', voucher.id)
            .eq('status', 'paid');

          const orderCount = orders?.length || 0;
          const totalRevenue = orders?.reduce((sum, o) => sum + (o.bank_amount || 0), 0) || 0;
          const totalDiscount = orders?.reduce((sum, o) => sum + (o.discount_amount || 0), 0) || 0;

          return {
            code: voucher.code,
            used_count: voucher.used_count || 0,
            order_count: orderCount,
            total_revenue: totalRevenue,
            total_discount: totalDiscount,
          };
        })
      );

      return voucherStats.sort((a, b) => b.total_revenue - a.total_revenue);
    },
    enabled: !!user?.id,
  });

  const { data: usageOverTime } = useQuery({
    queryKey: ['voucher-usage-overtime', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: vouchers } = await supabase
        .from('vouchers')
        .select('id')
        .eq('created_by', user.id);

      if (!vouchers?.length) return [];

      const voucherIds = vouchers.map(v => v.id);

      // Get orders from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: orders } = await supabase
        .from('orders')
        .select('created_at, discount_amount')
        .in('voucher_id', voucherIds)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (!orders?.length) return [];

      // Group by date
      const grouped = orders.reduce((acc: any, order) => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, usage_count: 0, discount_amount: 0 };
        }
        acc[date].usage_count++;
        acc[date].discount_amount += order.discount_amount || 0;
        return acc;
      }, {});

      return Object.values(grouped);
    },
    enabled: !!user?.id,
  });

  return {
    summary: summary || { totalVouchers: 0, activeVouchers: 0, totalUsage: 0, totalDiscount: 0 },
    topVouchers: topVouchers || [],
    usageOverTime: usageOverTime || [],
  };
};
