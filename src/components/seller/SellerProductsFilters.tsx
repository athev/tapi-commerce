
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SellerProductsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
}

const SellerProductsFilters = ({ 
  searchTerm, 
  onSearchChange, 
  category, 
  onCategoryChange 
}: SellerProductsFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="w-full md:w-64">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            <SelectItem value="Ebook">Ebook</SelectItem>
            <SelectItem value="Khóa học">Khóa học</SelectItem>
            <SelectItem value="Phần mềm">Phần mềm</SelectItem>
            <SelectItem value="Template">Template</SelectItem>
            <SelectItem value="Âm nhạc">Âm nhạc</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SellerProductsFilters;
