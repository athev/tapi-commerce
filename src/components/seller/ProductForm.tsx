import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProductUpload, ProductFormData } from "@/hooks/useProductUpload";
import { useAuth } from "@/context/AuthContext";
import ProductBasicInfo from "./ProductBasicInfo";
import ProductDescription from "./ProductDescription";
import ProductImageUpload from "./ProductImageUpload";
import ProductFileUpload from "./ProductFileUpload";
import { toast } from "sonner";

const ProductForm = () => {
  const navigate = useNavigate();
  const { user, profile, session, loading } = useAuth();
  const { isSubmitting, submitProduct } = useProductUpload();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
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

  // Add timeout for loading state to prevent infinite loading
  useEffect(() => {
    console.log('ProductForm auth state:', { user: !!user, profile: !!profile, session: !!session, loading });
    
    if (loading) {
      const timer = setTimeout(() => {
        console.log('Loading timeout reached, forcing render');
        setLoadingTimeout(true);
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading, user, profile, session]);

  // Show loading state only while auth is actively loading (with timeout)
  if (loading && !loadingTimeout) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2">Đang tải...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show auth error if user is not authenticated
  if (!user || !session) {
    console.log('User not authenticated, redirecting to login');
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Bạn cần đăng nhập
            </h3>
            <p className="text-gray-500 mb-4">
              Vui lòng đăng nhập để tạo sản phẩm mới
            </p>
            <Button onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show seller registration prompt if profile is missing or loading timed out
  if (!profile || loadingTimeout) {
    console.log('Profile missing or loading timed out:', { profile: !!profile, loadingTimeout });
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {loadingTimeout ? 'Không thể tải thông tin người bán' : 'Bạn chưa có gian hàng'}
            </h3>
            <p className="text-gray-500 mb-4">
              {loadingTimeout 
                ? 'Có lỗi xảy ra khi tải thông tin. Vui lòng thử lại hoặc đăng ký làm người bán.'
                : 'Vui lòng đăng ký làm người bán để tạo sản phẩm'
              }
            </p>
            <div className="space-x-2">
              <Button onClick={() => navigate('/register-seller')}>
                Đăng ký người bán
              </Button>
              {loadingTimeout && (
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Tải lại trang
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('ProductForm rendering with valid auth state');

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
    
    // Clear error when user starts typing
    if (errors[name as keyof ProductFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user selects
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
      // Reset form on success
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

export default ProductForm;
