
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductUpload, ProductFormData } from "@/hooks/useProductUpload";
import ProductBasicInfo from "./ProductBasicInfo";
import ProductDescription from "./ProductDescription";
import ProductImageUpload from "./ProductImageUpload";
import ProductFileUpload from "./ProductFileUpload";

const ProductForm = () => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, image: file }));
  };

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, file: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitProduct(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin sản phẩm</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <ProductBasicInfo 
            formData={formData}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
          />
          
          <ProductDescription 
            value={formData.description}
            onChange={handleInputChange}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProductImageUpload 
              image={formData.image}
              onImageChange={handleImageChange}
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
              {isSubmitting ? 'Đang xử lý...' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
