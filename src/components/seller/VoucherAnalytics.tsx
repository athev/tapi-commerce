import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useVoucherAnalytics } from '@/hooks/useVoucherAnalytics';
import { formatPrice } from '@/utils/priceUtils';
import { TrendingUp, Ticket, DollarSign, Users } from 'lucide-react';

export const VoucherAnalytics = () => {
  const { summary, topVouchers, usageOverTime } = useVoucherAnalytics();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng voucher</p>
                <p className="text-2xl font-bold">{summary.totalVouchers}</p>
              </div>
              <Ticket className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600">{summary.activeVouchers}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lượt sử dụng</p>
                <p className="text-2xl font-bold">{summary.totalUsage}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng giảm</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatPrice(summary.totalDiscount)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Vouchers Table */}
      {topVouchers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top mã giảm giá</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead className="text-right">Lượt dùng</TableHead>
                    <TableHead className="text-right">Số đơn</TableHead>
                    <TableHead className="text-right">Doanh số</TableHead>
                    <TableHead className="text-right">Tổng giảm</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topVouchers.map((voucher, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{voucher.code}</TableCell>
                      <TableCell className="text-right">{voucher.used_count}</TableCell>
                      <TableCell className="text-right">{voucher.order_count}</TableCell>
                      <TableCell className="text-right">
                        {formatPrice(voucher.total_revenue)}
                      </TableCell>
                      <TableCell className="text-right text-orange-600">
                        {formatPrice(voucher.total_discount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {usageOverTime.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Doanh số theo ngày</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usageOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => formatPrice(value)}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')}
                  />
                  <Bar dataKey="discount_amount" fill="hsl(var(--primary))" name="Giảm giá" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lượt sử dụng theo ngày</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={usageOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="usage_count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Lượt dùng"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {topVouchers.length === 0 && usageOverTime.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Ticket className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Chưa có dữ liệu thống kê</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoucherAnalytics;
