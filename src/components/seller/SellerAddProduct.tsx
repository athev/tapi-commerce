
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const SellerAddProduct = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    inStock: '',
    image: null as File | null,
    file: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'file') => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [field]: e.target.files?.[0] || null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Bạn cần đăng nhập để thêm sản phẩm');
      return;
    }
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.price || !formData.category) {
      toast.error('Vui lòng điền đầy đủ thông tin sản phẩm');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, you would:
      // 1. Upload the image/file to Supabase Storage
      // 2. Insert the product into the products table
      
      // Simulate success for now
      setTimeout(() => {
        toast.success('Sản phẩm đã được tạo thành công');
        navigate('/seller/products');
      }, 1500);
      
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Thêm sản phẩm mới</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Thông tin sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Tên sản phẩm</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ebook">Ebook</SelectItem>
                    <SelectItem value="Khóa học">Khóa học</SelectItem>
                    <SelectItem value="Phần mềm">Phần mềm</SelectItem>
                    <SelectItem value="Template">Template</SelectItem>
                    <SelectItem value="Âm nhạc">Âm nhạc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Giá (VND)</Label>
                <Input 
                  id="price" 
                  name="price" 
                  type="number" 
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inStock">Số lượng có sẵn</Label>
                <Input 
                  id="inStock" 
                  name="inStock" 
                  type="number" 
                  value={formData.inStock}
                  onChange={handleInputChange}
                  placeholder="Để trống nếu không giới hạn"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả sản phẩm</Label>
              <Textarea 
                id="description" 
                name="description" 
                rows={5}
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="image">Ảnh sản phẩm</Label>
                <Input 
                  id="image" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'image')}
                />
                <p className="text-xs text-gray-500">
                  Chọn ảnh đại diện cho sản phẩm (PNG, JPG)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="file">File sản phẩm</Label>
                <Input 
                  id="file" 
                  type="file"
                  onChange={(e) => handleFileChange(e, 'file')}
                />
                <p className="text-xs text-gray-500">
                  Upload file sản phẩm để khách hàng tải xuống sau khi mua
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/seller/products')}
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
    </div>
  );
};

export default SellerAddProduct;
