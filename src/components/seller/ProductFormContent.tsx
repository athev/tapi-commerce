
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductUpload, ProductFormData } from "@/hooks/useProductUpload";
import ProductBasicInfo from "./ProductBasicInfo";
import ProductDescription from "./ProductDescription";
import ProductImageUpload from "./ProductImageUpload";
import ProductFileUpload from "./ProductFileUpload";
import { toast } from "sonner";

const ProductFormContent = () => {
  const navigate = useNavigate();
  const { isSubmitting, submitProduct } = useProductUpload();
  
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: '',
    category: '',
    inStock: '',
    image: null,
    file: null
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tên sản phẩm là bắt buộc";
    } else if (formData.title.length < 3) {
      newErrors.title = "Tên sản phẩm phải có ít nhất 3 ký tự";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Mô tả sản phẩm là bắt buộc";
    } else if (formData.description.length < 10) {
      newErrors.description = "Mô tả phải có ít nhất 10 ký tự";
    }

    if (!formData.price || isNaN(Number(formData.price))) {
      newErrors.price = "Giá sản phẩm là bắt buộc và phải là số";
    } else if (Number(formData.price) <= 0) {
      newErrors.price = "Giá sản phẩm phải lớn hơn 0";
    }

    if (!formData.category) {
      newErrors.category = "Danh mục là bắt buộc";
    }

    if (!formData.image) {
      newErrors.image = "Ảnh sản phẩm là bắt buộc";
    }

    if (formData.inStock && (isNaN(Number(formData.inStock)) || Number(formData.inStock) < 0)) {
      newErrors.inStock = "Số lượng phải là số không âm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof ProductFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof ProductFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, image: file }));
    
    if (file && errors.image) {
      setErrors(prev => ({ ...prev, image: undefined }));
    }
  };

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, file: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin sản phẩm");
      return;
    }

    const success = await submitProduct(formData);
    
    if (success) {
      setFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        inStock: '',
        image: null,
        file: null
      });
      setErrors({});
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin sản phẩm</CardTitle>
        <p className="text-sm text-gray-600">
          Điền đầy đủ thông tin để tạo sản phẩm mới trên gian hàng của bạn
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <ProductBasicInfo 
            formData={formData}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            errors={errors}
          />
          
          <ProductDescription 
            value={formData.description}
            onChange={handleInputChange}
            error={errors.description}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProductImageUpload 
              image={formData.image}
              onImageChange={handleImageChange}
              error={errors.image}
            />
            
            <ProductFileUpload 
              file={formData.file}
              onFileChange={handleFileChange}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/seller/products')}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>
            <Button 
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang tạo sản phẩm...' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductFormContent;
