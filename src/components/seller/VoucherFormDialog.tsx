import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context';
import { VoucherFormData } from '@/hooks/useVoucherManagement';
import { Checkbox } from '@/components/ui/checkbox';

interface VoucherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VoucherFormData) => void;
  initialData?: any;
  isLoading?: boolean;
}

export const VoucherFormDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData,
  isLoading 
}: VoucherFormDialogProps) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<VoucherFormData>({
    code: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_purchase_amount: 0,
    applicable_to: 'all',
    valid_from: new Date(),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    is_active: true,
  });

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { data: products } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('products')
        .select('id, title')
        .eq('seller_id', user.id)
        .eq('status', 'active');
      return data || [];
    },
    enabled: !!user?.id && open,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories')
        .select('name')
        .eq('is_active', true);
      return data || [];
    },
    enabled: open,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code,
        discount_type: initialData.discount_type,
        discount_value: initialData.discount_value,
        max_discount_amount: initialData.max_discount_amount,
        min_purchase_amount: initialData.min_purchase_amount,
        applicable_to: initialData.applicable_to,
        usage_limit: initialData.usage_limit,
        valid_from: new Date(initialData.valid_from),
        valid_until: new Date(initialData.valid_until),
        is_active: initialData.is_active,
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      product_ids: formData.applicable_to === 'specific_products' ? selectedProducts : undefined,
      category_names: formData.applicable_to === 'specific_categories' ? selectedCategories : undefined,
    };

    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã giảm giá *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="VD: SALE2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_type">Loại giảm giá *</Label>
              <Select
                value={formData.discount_type}
                onValueChange={(value: 'percentage' | 'fixed_amount') => 
                  setFormData({ ...formData, discount_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                  <SelectItem value="fixed_amount">Số tiền cố định (VNĐ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_value">Giá trị giảm *</Label>
              <Input
                id="discount_value"
                type="number"
                min="0"
                max={formData.discount_type === 'percentage' ? 100 : undefined}
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                required
              />
            </div>

            {formData.discount_type === 'percentage' && (
              <div className="space-y-2">
                <Label htmlFor="max_discount">Giảm tối đa (VNĐ)</Label>
                <Input
                  id="max_discount"
                  type="number"
                  min="0"
                  value={formData.max_discount_amount || ''}
                  onChange={(e) => setFormData({ ...formData, max_discount_amount: Number(e.target.value) || undefined })}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_purchase">Đơn tối thiểu (VNĐ)</Label>
              <Input
                id="min_purchase"
                type="number"
                min="0"
                value={formData.min_purchase_amount}
                onChange={(e) => setFormData({ ...formData, min_purchase_amount: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage_limit">Giới hạn sử dụng</Label>
              <Input
                id="usage_limit"
                type="number"
                min="0"
                value={formData.usage_limit || ''}
                onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) || undefined })}
                placeholder="Không giới hạn"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicable_to">Phạm vi áp dụng *</Label>
            <Select
              value={formData.applicable_to}
              onValueChange={(value: any) => setFormData({ ...formData, applicable_to: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toàn bộ sản phẩm</SelectItem>
                <SelectItem value="specific_products">Sản phẩm cụ thể</SelectItem>
                <SelectItem value="specific_categories">Danh mục cụ thể</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.applicable_to === 'specific_products' && (
            <div className="space-y-2">
              <Label>Chọn sản phẩm</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                {products?.map((product) => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={product.id}
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProducts([...selectedProducts, product.id]);
                        } else {
                          setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                        }
                      }}
                    />
                    <label htmlFor={product.id} className="text-sm cursor-pointer">
                      {product.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.applicable_to === 'specific_categories' && (
            <div className="space-y-2">
              <Label>Chọn danh mục</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                {categories?.map((category) => (
                  <div key={category.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.name}
                      checked={selectedCategories.includes(category.name)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories([...selectedCategories, category.name]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(name => name !== category.name));
                        }
                      }}
                    />
                    <label htmlFor={category.name} className="text-sm cursor-pointer">
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valid_from">Ngày bắt đầu *</Label>
              <Input
                id="valid_from"
                type="datetime-local"
                value={formData.valid_from.toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, valid_from: new Date(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid_until">Ngày kết thúc *</Label>
              <Input
                id="valid_until"
                type="datetime-local"
                value={formData.valid_until.toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, valid_until: new Date(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Kích hoạt ngay</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : (initialData ? 'Cập nhật' : 'Tạo mã')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
