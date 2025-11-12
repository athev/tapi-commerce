import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Ticket } from 'lucide-react';
import { useVoucherManagement } from '@/hooks/useVoucherManagement';
import { VoucherFormDialog } from './VoucherFormDialog';
import { formatPrice } from '@/utils/priceUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const SellerVoucherManager = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<string | null>(null);

  const {
    vouchers,
    isLoading,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    toggleVoucherStatus,
  } = useVoucherManagement();

  const handleCreate = () => {
    setEditingVoucher(null);
    setDialogOpen(true);
  };

  const handleEdit = (voucher: any) => {
    setEditingVoucher(voucher);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setVoucherToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (voucherToDelete) {
      deleteVoucher.mutate(voucherToDelete);
      setDeleteDialogOpen(false);
      setVoucherToDelete(null);
    }
  };

  const handleSubmit = (data: any) => {
    if (editingVoucher) {
      updateVoucher.mutate(
        { id: editingVoucher.id, formData: data },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingVoucher(null);
          },
        }
      );
    } else {
      createVoucher.mutate(data, {
        onSuccess: () => {
          setDialogOpen(false);
        },
      });
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleVoucherStatus.mutate({ id, is_active: !currentStatus });
  };

  const formatDiscountDisplay = (voucher: any) => {
    if (voucher.discount_type === 'fixed_amount') {
      return formatPrice(voucher.discount_value);
    }
    return `${voucher.discount_value}%`;
  };

  const getApplicableScope = (voucher: any) => {
    if (voucher.applicable_to === 'all') return 'Toàn bộ';
    if (voucher.applicable_to === 'specific_products') return 'Sản phẩm';
    return 'Danh mục';
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            <CardTitle>Quản lý mã giảm giá</CardTitle>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo mã mới
          </Button>
        </CardHeader>
        <CardContent>
          {vouchers.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Chưa có mã giảm giá nào</p>
              <Button onClick={handleCreate}>Tạo mã đầu tiên</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã</TableHead>
                    <TableHead>Giảm giá</TableHead>
                    <TableHead>Phạm vi</TableHead>
                    <TableHead>Sử dụng</TableHead>
                    <TableHead>Hiệu lực</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell className="font-medium">{voucher.code}</TableCell>
                      <TableCell>{formatDiscountDisplay(voucher)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getApplicableScope(voucher)}</Badge>
                      </TableCell>
                      <TableCell>
                        {voucher.used_count || 0}
                        {voucher.usage_limit && ` / ${voucher.usage_limit}`}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{new Date(voucher.valid_from).toLocaleDateString('vi-VN')}</div>
                        <div className="text-muted-foreground">
                          đến {new Date(voucher.valid_until).toLocaleDateString('vi-VN')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={voucher.is_active}
                          onCheckedChange={() => handleToggleStatus(voucher.id, voucher.is_active)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(voucher)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(voucher.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <VoucherFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingVoucher}
        isLoading={createVoucher.isPending || updateVoucher.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa mã giảm giá này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SellerVoucherManager;
