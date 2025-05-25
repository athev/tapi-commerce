
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProductFormData {
  title: string;
  description: string;
  price: string;
  category: string;
  inStock: string;
  image: File | null;
  file: File | null;
}

export const useProductUpload = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrl;
  };

  const submitProduct = async (formData: ProductFormData) => {
    if (!user || !profile) {
      toast.error('Bạn cần đăng nhập để thêm sản phẩm');
      return;
    }
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      toast.error('Vui lòng điền đầy đủ thông tin sản phẩm');
      return;
    }

    if (!formData.image) {
      toast.error('Vui lòng chọn ảnh sản phẩm');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let imageUrl = '';
      let fileUrl = '';

      // Upload image
      if (formData.image) {
        const imageFileName = `${Date.now()}-${formData.image.name}`;
        imageUrl = await uploadFile(formData.image, 'product-images', imageFileName);
        console.log('Image uploaded successfully:', imageUrl);
      }

      // Upload product file if provided
      if (formData.file) {
        const fileFileName = `${Date.now()}-${formData.file.name}`;
        fileUrl = await uploadFile(formData.file, 'product-files', fileFileName);
        console.log('Product file uploaded successfully:', fileUrl);
      }

      // Insert product into database
      const { data, error } = await supabase
        .from('products')
        .insert({
          title: formData.title,
          description: formData.description,
          price: parseInt(formData.price),
          category: formData.category,
          seller_id: user.id,
          seller_name: profile.full_name,
          image: imageUrl,
          file_url: fileUrl || null,
          in_stock: formData.inStock ? parseInt(formData.inStock) : null,
          purchases: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Product created successfully:', data);
      toast.success('Sản phẩm đã được tạo thành công!');
      navigate('/seller/products');
      
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi tạo sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitProduct
  };
};
