
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'file') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, [field]: file }));
      
      // Create preview for image
      if (field === 'image') {
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeFile = (field: 'image' | 'file') => {
    setFormData(prev => ({ ...prev, [field]: null }));
    if (field === 'image') {
      setImagePreview(null);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
                <Label htmlFor="title">Tên sản phẩm *</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục *</Label>
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
                <Label htmlFor="price">Giá (VND) *</Label>
                <Input 
                  id="price" 
                  name="price" 
                  type="number" 
                  min="0"
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
                  min="0"
                  value={formData.inStock}
                  onChange={handleInputChange}
                  placeholder="Để trống nếu không giới hạn"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả sản phẩm *</Label>
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
                <Label htmlFor="image">Ảnh sản phẩm *</Label>
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeFile('image')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <Label htmlFor="image" className="cursor-pointer">
                      <span className="text-sm text-gray-600">Nhấn để chọn ảnh</span>
                      <Input 
                        id="image" 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'image')}
                        className="hidden"
                        required
                      />
                    </Label>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Chọn ảnh đại diện cho sản phẩm (PNG, JPG, tối đa 5MB)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="file">File sản phẩm</Label>
                {formData.file ? (
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <span className="text-sm text-gray-600">{formData.file.name}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile('file')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <Label htmlFor="file" className="cursor-pointer">
                      <span className="text-sm text-gray-600">Nhấn để chọn file</span>
                      <Input 
                        id="file" 
                        type="file"
                        onChange={(e) => handleFileChange(e, 'file')}
                        className="hidden"
                      />
                    </Label>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Upload file sản phẩm để khách hàng tải xuống sau khi mua (tùy chọn)
                </p>
              </div>
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
    </div>
  );
};

export default SellerAddProduct;
