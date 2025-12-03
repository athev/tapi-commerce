import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical, Upload, X, ImageIcon } from "lucide-react";
import { ProductVariant } from "@/lib/productValidationSchemas";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductVariantsManagerProps {
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  basePrice: number;
}

// Generate unique temporary ID for new variants
const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const ProductVariantsManager = ({
  variants,
  onVariantsChange,
  basePrice,
}: ProductVariantsManagerProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempVariant, setTempVariant] = useState<Partial<ProductVariant>>({});
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: generateTempId(),
      variant_name: "",
      price: basePrice,
      original_price: null,
      discount_percentage: null,
      badge: null,
      sort_order: variants.length,
      is_active: true,
      in_stock: 999,
      description: null,
      image_url: null,
    };
    onVariantsChange([...variants, newVariant]);
    setEditingId(newVariant.id!);
    setTempVariant(newVariant);
  };

  const updateVariant = (variantId: string) => {
    // Calculate discount percentage if original price exists
    if (tempVariant.original_price && tempVariant.price) {
      const discount = ((tempVariant.original_price - tempVariant.price) / tempVariant.original_price) * 100;
      tempVariant.discount_percentage = Math.round(discount);
    }
    
    const updated = variants.map(v => 
      v.id === variantId ? { ...v, ...tempVariant } : v
    );
    onVariantsChange(updated);
    setEditingId(null);
    setTempVariant({});
  };

  const removeVariant = (variantId: string) => {
    const updated = variants.filter(v => v.id !== variantId);
    onVariantsChange(updated);
  };

  const formatPrice = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Ảnh không được quá 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({
        title: "Lỗi",
        description: "Chỉ chấp nhận định dạng JPG, PNG, WEBP",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `variant-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      setTempVariant({ ...tempVariant, image_url: publicUrl });
      toast({
        title: "Thành công",
        description: "Đã tải ảnh lên",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải ảnh lên",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setTempVariant({ ...tempVariant, image_url: null });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Các gói sản phẩm</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {variants.map((variant) => (
          <div key={variant.id || `variant-${variant.variant_name}`} className="border rounded-lg p-4 space-y-3">
            {editingId === variant.id ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Tên gói *</Label>
                  <Input
                    value={tempVariant.variant_name || ""}
                    onChange={(e) =>
                      setTempVariant({ ...tempVariant, variant_name: e.target.value })
                    }
                    placeholder="VD: Gói 1 tháng, Gói 1 năm"
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label>Ảnh biến thể (tùy chọn)</Label>
                  {tempVariant.image_url ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                      <img
                        src={tempVariant.image_url}
                        alt="Variant"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center py-2">
                        {uploading ? (
                          <div className="text-sm text-muted-foreground">Đang tải...</div>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">Tải ảnh lên</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Giá bán *</Label>
                    <div className="relative">
                      <Input
                        value={formatPrice(tempVariant.price?.toString() || "")}
                        onChange={(e) => {
                          const value = e.target.value.replace(/,/g, '');
                          setTempVariant({ ...tempVariant, price: parseInt(value) || 0 });
                        }}
                        placeholder="50,000"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        ₫
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Giá gốc (tùy chọn)</Label>
                    <div className="relative">
                      <Input
                        value={formatPrice(tempVariant.original_price?.toString() || "")}
                        onChange={(e) => {
                          const value = e.target.value.replace(/,/g, '');
                          setTempVariant({
                            ...tempVariant,
                            original_price: value ? parseInt(value) : null,
                          });
                        }}
                        placeholder="100,000"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        ₫
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Badge (tùy chọn)</Label>
                  <Input
                    value={tempVariant.badge || ""}
                    onChange={(e) =>
                      setTempVariant({ ...tempVariant, badge: e.target.value || null })
                    }
                    placeholder="PHỔ BIẾN, TIẾT KIỆM NHẤT..."
                    maxLength={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Số lượng tồn kho</Label>
                  <Input
                    type="number"
                    min={0}
                    value={tempVariant.in_stock ?? 999}
                    onChange={(e) =>
                      setTempVariant({ ...tempVariant, in_stock: parseInt(e.target.value) || 0 })
                    }
                    placeholder="999"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mô tả phân loại (tùy chọn)</Label>
                  <Textarea
                    value={tempVariant.description || ""}
                    onChange={(e) =>
                      setTempVariant({ ...tempVariant, description: e.target.value || null })
                    }
                    placeholder="Mô tả thêm về gói này..."
                    maxLength={500}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => updateVariant(variant.id!)} size="sm">
                    Lưu
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingId(null);
                      setTempVariant({});
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  {/* Variant thumbnail */}
                  {variant.image_url ? (
                    <div className="w-12 h-12 rounded-md overflow-hidden border shrink-0">
                      <img
                        src={variant.image_url}
                        alt={variant.variant_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{variant.variant_name}</p>
                      {variant.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {variant.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold text-destructive">
                        {variant.price.toLocaleString('vi-VN')}₫
                      </span>
                      {variant.original_price && (
                        <>
                          <span className="line-through text-muted-foreground">
                            {variant.original_price.toLocaleString('vi-VN')}₫
                          </span>
                          <Badge variant="destructive" className="text-xs">
                            -{variant.discount_percentage}%
                          </Badge>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Tồn kho: <span className="font-semibold text-foreground">{variant.in_stock ?? 999}</span></span>
                      {variant.description && (
                        <span className="line-clamp-1">• {variant.description}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setEditingId(variant.id!);
                      setTempVariant(variant);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Sửa
                  </Button>
                  <Button
                    onClick={() => removeVariant(variant.id!)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        <Button onClick={addVariant} variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Thêm gói mới
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductVariantsManager;