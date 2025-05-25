
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductFormData } from "@/hooks/useProductUpload";

interface ProductBasicInfoProps {
  formData: ProductFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

const ProductBasicInfo = ({ formData, onInputChange, onSelectChange }: ProductBasicInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="title">Tên sản phẩm *</Label>
        <Input 
          id="title" 
          name="title" 
          value={formData.title}
          onChange={onInputChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Danh mục *</Label>
        <Select 
          value={formData.category} 
          onValueChange={(value) => onSelectChange('category', value)}
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
          onChange={onInputChange}
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
          onChange={onInputChange}
          placeholder="Để trống nếu không giới hạn"
        />
      </div>
    </div>
  );
};

export default ProductBasicInfo;
