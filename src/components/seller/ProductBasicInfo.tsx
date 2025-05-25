
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductFormData } from "@/hooks/useProductUpload";

interface ProductBasicInfoProps {
  formData: ProductFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  errors?: Partial<ProductFormData>;
}

const ProductBasicInfo = ({ formData, onInputChange, onSelectChange, errors }: ProductBasicInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="title">Tên sản phẩm *</Label>
        <Input 
          id="title" 
          name="title" 
          value={formData.title}
          onChange={onInputChange}
          className={errors?.title ? "border-red-500" : ""}
          placeholder="Nhập tên sản phẩm..."
        />
        {errors?.title && (
          <p className="text-sm text-red-500">{errors.title}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Danh mục *</Label>
        <Select 
          value={formData.category} 
          onValueChange={(value) => onSelectChange('category', value)}
        >
          <SelectTrigger className={errors?.category ? "border-red-500" : ""}>
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ebook">📚 Ebook</SelectItem>
            <SelectItem value="Khóa học">🎓 Khóa học</SelectItem>
            <SelectItem value="Phần mềm">💻 Phần mềm</SelectItem>
            <SelectItem value="Template">🎨 Template</SelectItem>
            <SelectItem value="Âm nhạc">🎵 Âm nhạc</SelectItem>
          </SelectContent>
        </Select>
        {errors?.category && (
          <p className="text-sm text-red-500">{errors.category}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="price">Giá (VND) *</Label>
        <Input 
          id="price" 
          name="price" 
          type="number" 
          min="0"
          step="1000"
          value={formData.price}
          onChange={onInputChange}
          className={errors?.price ? "border-red-500" : ""}
          placeholder="0"
        />
        {errors?.price && (
          <p className="text-sm text-red-500">{errors.price}</p>
        )}
        <p className="text-xs text-gray-500">
          Giá hiển thị: {formData.price ? new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND',
            maximumFractionDigits: 0 
          }).format(Number(formData.price)) : '0 ₫'}
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="inStock">Số lượng có sẵn</Label>
        <Input 
          id="inStock" 
          name="inStock" 
          type="number" 
          min="0"
          value={formData.inStock}
          onChange={onInputChange}
          className={errors?.inStock ? "border-red-500" : ""}
          placeholder="Để trống nếu không giới hạn"
        />
        {errors?.inStock && (
          <p className="text-sm text-red-500">{errors.inStock}</p>
        )}
        <p className="text-xs text-gray-500">
          Để trống nếu sản phẩm số không giới hạn số lượng
        </p>
      </div>
    </div>
  );
};

export default ProductBasicInfo;
