
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
    console.log(`Uploading file to ${bucket}/${path}:`, file.name);
    
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

    console.log('File uploaded successfully, public URL:', publicUrl);
    return publicUrl;
  };

  const submitProduct = async (formData: ProductFormData): Promise<boolean> => {
    console.log('Starting product submission with data:', formData);
    
    if (!user || !profile) {
      toast.error('Bạn cần đăng nhập để thêm sản phẩm');
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      let imageUrl = '';
      let fileUrl = '';

      // Upload image
      if (formData.image) {
        const imageFileName = `${user.id}/${Date.now()}-${formData.image.name}`;
        imageUrl = await uploadFile(formData.image, 'product-images', imageFileName);
        console.log('Image uploaded successfully:', imageUrl);
      }

      // Upload product file if provided
      if (formData.file) {
        const fileFileName = `${user.id}/${Date.now()}-${formData.file.name}`;
        fileUrl = await uploadFile(formData.file, 'product-files', fileFileName);
        console.log('Product file uploaded successfully:', fileUrl);
      }

      // Insert product into database
      const productData = {
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
      };

      console.log('Inserting product data:', productData);

      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Product created successfully:', data);
      toast.success('🎉 Sản phẩm đã được tạo thành công!', {
        description: 'Sản phẩm của bạn đã được thêm vào gian hàng',
        duration: 4000,
      });
      
      // Navigate back to products list
      setTimeout(() => {
        navigate('/seller/products');
      }, 1000);
      
      return true;
      
    } catch (error: any) {
      console.error('Error creating product:', error);
      
      if (error.message?.includes('storage')) {
        toast.error('Lỗi upload file. Vui lòng thử lại.');
      } else if (error.message?.includes('duplicate')) {
        toast.error('Sản phẩm với tên này đã tồn tại.');
      } else {
        toast.error('Có lỗi xảy ra khi tạo sản phẩm. Vui lòng thử lại.');
      }
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitProduct
  };
};
