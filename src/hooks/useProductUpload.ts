
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductVariant } from "@/lib/productValidationSchemas";

export interface ProductFormData {
  title: string;
  description: string;
  price: string;
  category: string;
  inStock: string;
  image: File | null;
  galleryImages?: File[];
  file: File | null;
  product_type: string;
  delivery_data: Record<string, any>;
  variants?: ProductVariant[];
}

export const useProductUpload = () => {
  const { user, profile, session } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadFile = async (file: File, bucket: string, path: string) => {
    console.log(`Uploading file to ${bucket}/${path}:`, file.name);
    
    if (!session) {
      throw new Error('No valid session found');
    }
    
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
    
    if (!user || !session) {
      console.error('Authentication check failed:', { user: !!user, session: !!session });
      toast.error('Bạn cần đăng nhập để thêm sản phẩm');
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      let imageUrl = '';
      let fileUrl = '';
      const galleryUrls: string[] = [];

      // Upload main image
      if (formData.image) {
        const imageFileName = `${user.id}/${Date.now()}-${formData.image.name}`;
        imageUrl = await uploadFile(formData.image, 'product-images', imageFileName);
        console.log('Image uploaded successfully:', imageUrl);
      }

      // Upload gallery images
      if (formData.galleryImages && formData.galleryImages.length > 0) {
        for (const galleryImage of formData.galleryImages) {
          const galleryFileName = `${user.id}/${Date.now()}-${galleryImage.name}`;
          const galleryUrl = await uploadFile(galleryImage, 'product-images', galleryFileName);
          galleryUrls.push(galleryUrl);
          console.log('Gallery image uploaded:', galleryUrl);
        }
      }

      // Validate file requirement for file_download products
      if (formData.product_type === 'file_download' && !formData.file) {
        toast.error('Sản phẩm loại "File tải về" cần có file đính kèm');
        return false;
      }

      // Upload product file if provided and product type supports it
      if (formData.file && formData.product_type === 'file_download') {
        const fileFileName = `${user.id}/${Date.now()}-${formData.file.name}`;
        fileUrl = await uploadFile(formData.file, 'product-files', fileFileName);
        console.log('Product file uploaded successfully:', fileUrl);
      }

      const sellerName = profile?.full_name || user.email || 'Unknown Seller';
      
      console.log('Using seller info:', {
        sellerId: user.id,
        sellerName: sellerName,
        profileAvailable: !!profile
      });

      // Insert product into database
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price),
        category: formData.category,
        seller_id: user.id,
        seller_name: sellerName,
        image: imageUrl,
        file_url: fileUrl || null,
        in_stock: formData.inStock ? parseInt(formData.inStock) : null,
        purchases: 0,
        product_type: formData.product_type,
        delivery_data: formData.delivery_data,
        status: 'active',
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

      // Insert gallery images
      if (galleryUrls.length > 0 && data) {
        const galleryData = galleryUrls.map((url, index) => ({
          product_id: data.id,
          image_url: url,
          sort_order: index,
          is_main: false,
        }));

        const { error: galleryError } = await supabase
          .from('product_images')
          .insert(galleryData);

        if (galleryError) {
          console.error('Gallery images insert error:', galleryError);
        }
      }

      // Insert product variants
      if (formData.variants && formData.variants.length > 0 && data) {
        const variantsData = formData.variants.map(variant => ({
          product_id: data.id,
          variant_name: variant.variant_name,
          price: variant.price,
          original_price: variant.original_price,
          discount_percentage: variant.discount_percentage,
          badge: variant.badge,
          sort_order: variant.sort_order,
          is_active: variant.is_active,
        }));

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsData);

        if (variantsError) {
          console.error('Variants insert error:', variantsError);
        }
      }
      
      toast.success('🎉 Sản phẩm đã được tạo thành công!', {
        description: 'Sản phẩm của bạn đã được thêm vào gian hàng',
        duration: 4000,
      });
      
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
      } else if (error.message?.includes('session') || error.message?.includes('authentication')) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('INSUFFICIENT_RESOURCES')) {
        toast.error('Lỗi kết nối Supabase. Vui lòng thử lại sau.');
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
