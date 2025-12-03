import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Package, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductVariantsManager from "@/components/seller/ProductVariantsManager";
import { ProductVariant } from "@/lib/productValidationSchemas";

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    in_stock: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) return;

      try {
        // Fetch product
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (productError) throw productError;

        setFormData({
          title: product.title || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          category: product.category || "",
          in_stock: product.in_stock?.toString() || "",
        });
        
        setCurrentImage(product.image || '');
        setImagePreview(product.image || '');

        // Fetch only active variants
        const { data: variantsData } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', productId)
          .eq('is_active', true)
          .order('sort_order');

        if (variantsData && variantsData.length > 0) {
          setVariants(variantsData.map(v => ({
            id: v.id,
            variant_name: v.variant_name,
            price: v.price,
            original_price: v.original_price,
            discount_percentage: v.discount_percentage,
            badge: v.badge,
            sort_order: v.sort_order ?? 0,
            is_active: v.is_active ?? true,
            in_stock: v.in_stock ?? 999,
            description: v.description,
          })));
        }

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        setCategories(categoriesData || []);
      } catch (error: any) {
        console.error('Error fetching product:', error);
        toast.error("Không thể tải thông tin sản phẩm");
        navigate('/seller/products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    setIsSaving(true);
    try {
      let imageUrl = currentImage;

      // Upload new image if selected
      if (newImageFile) {
        setIsUploadingImage(true);
        const fileExt = newImageFile.name.split('.').pop();
        const fileName = `${productId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, newImageFile, { upsert: true });
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
        setIsUploadingImage(false);
      }

      const { error } = await supabase
        .from('products')
        .update({
          title: formData.title,
          description: formData.description,
          price: parseInt(formData.price),
          category: formData.category,
          in_stock: parseInt(formData.in_stock),
          image: imageUrl,
        })
        .eq('id', productId);

      if (error) throw error;

      // === UPSERT + SOFT DELETE LOGIC FOR VARIANTS ===
      
      // 1. Get current variant IDs in form (real UUIDs only, not temp IDs)
      const currentVariantIds = variants
        .filter(v => v.id && !v.id.startsWith('temp-'))
        .map(v => v.id);
      
      // 2. Get existing variants from DB
      const { data: existingVariants } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', productId)
        .eq('is_active', true);
      
      const existingIds = existingVariants?.map(v => v.id) || [];
      
      // 3. Find variants to soft delete (in DB but not in form)
      const idsToRemove = existingIds.filter(id => !currentVariantIds.includes(id));
      
      // 4. Soft delete removed variants
      if (idsToRemove.length > 0) {
        console.log(`Soft deleting ${idsToRemove.length} variants`);
        const { error: softDeleteError } = await supabase
          .from('product_variants')
          .update({ is_active: false })
          .in('id', idsToRemove);
        
        if (softDeleteError) {
          console.error('Error soft deleting variants:', softDeleteError);
          throw softDeleteError;
        }
      }
      
      // 5. Update existing variants and insert new ones
      for (const variant of variants) {
        const variantData = {
          variant_name: variant.variant_name,
          price: variant.price,
          original_price: variant.original_price,
          discount_percentage: variant.discount_percentage,
          badge: variant.badge,
          sort_order: variant.sort_order,
          is_active: true,
          in_stock: variant.in_stock ?? 999,
          description: variant.description,
        };
        
        if (variant.id && !variant.id.startsWith('temp-')) {
          // UPDATE existing variant
          const { error: updateError } = await supabase
            .from('product_variants')
            .update(variantData)
            .eq('id', variant.id);
          
          if (updateError) {
            console.error('Error updating variant:', updateError);
            throw updateError;
          }
        } else {
          // INSERT new variant
          const { error: insertError } = await supabase
            .from('product_variants')
            .insert({
              product_id: productId,
              ...variantData,
            });
          
          if (insertError) {
            console.error('Error inserting variant:', insertError);
            throw insertError;
          }
        }
      }

      toast.success("Cập nhật sản phẩm thành công!");
      navigate('/seller/products');
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error("Lỗi khi cập nhật sản phẩm");
      setIsUploadingImage(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/seller/products')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">Chỉnh sửa sản phẩm</h2>
          <p className="text-muted-foreground">
            Cập nhật thông tin sản phẩm của bạn
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Thông tin sản phẩm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Tên sản phẩm *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Hình ảnh sản phẩm</Label>
              {imagePreview && (
                <div className="relative w-full h-48 mb-2 rounded-md overflow-hidden border">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("Kích thước file không được vượt quá 5MB");
                      return;
                    }
                    setNewImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                JPG, PNG hoặc WEBP (tối đa 5MB)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Danh mục *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Giá (VNĐ) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Nhập giá sản phẩm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="in_stock">Số lượng trong kho</Label>
              <Input
                id="in_stock"
                type="number"
                value={formData.in_stock}
                onChange={(e) => setFormData({ ...formData, in_stock: e.target.value })}
                placeholder="Nhập số lượng"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả sản phẩm</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết về sản phẩm..."
                rows={12}
                className="min-h-[300px] resize-y"
              />
            </div>

            <ProductVariantsManager
              variants={variants}
              onVariantsChange={setVariants}
              basePrice={parseInt(formData.price) || 0}
            />

            <div className="flex space-x-3">
              <Button type="submit" disabled={isSaving || isUploadingImage}>
                {isSaving || isUploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isUploadingImage ? "Đang tải ảnh..." : "Đang lưu..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/seller/products')}
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProduct;
