import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { ProductVariant } from "@/lib/productValidationSchemas";

interface ProductVariantsManagerProps {
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  basePrice: number;
}

const ProductVariantsManager = ({
  variants,
  onVariantsChange,
  basePrice,
}: ProductVariantsManagerProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempVariant, setTempVariant] = useState<Partial<ProductVariant>>({});

  const addVariant = () => {
    const newVariant: ProductVariant = {
      variant_name: "",
      price: basePrice,
      original_price: null,
      discount_percentage: null,
      badge: null,
      sort_order: variants.length,
      is_active: true,
    };
    onVariantsChange([...variants, newVariant]);
    setEditingIndex(variants.length);
    setTempVariant(newVariant);
  };

  const updateVariant = (index: number) => {
    const updated = [...variants];
    
    // Calculate discount percentage if original price exists
    if (tempVariant.original_price && tempVariant.price) {
      const discount = ((tempVariant.original_price - tempVariant.price) / tempVariant.original_price) * 100;
      tempVariant.discount_percentage = Math.round(discount);
    }
    
    updated[index] = { ...updated[index], ...tempVariant };
    onVariantsChange(updated);
    setEditingIndex(null);
    setTempVariant({});
  };

  const removeVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    onVariantsChange(updated);
  };

  const formatPrice = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Các gói sản phẩm</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {variants.map((variant, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            {editingIndex === index ? (
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

                <div className="flex gap-2">
                  <Button onClick={() => updateVariant(index)} size="sm">
                    Lưu
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingIndex(null);
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
                  <div>
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
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setEditingIndex(index);
                      setTempVariant(variant);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Sửa
                  </Button>
                  <Button
                    onClick={() => removeVariant(index)}
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
