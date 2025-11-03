import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  priceRange: [number, number];
  rating: number | null;
  categories: string[];
  inStock: boolean;
}

const CATEGORIES = [
  "Ebook",
  "Khóa học",
  "Phần mềm",
  "Template",
  "Dịch vụ",
];

const FilterPanel = ({ onFilterChange }: FilterPanelProps) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [inStock, setInStock] = useState(true);

  const handleApplyFilters = () => {
    onFilterChange({
      priceRange,
      rating: selectedRating,
      categories: selectedCategories,
      inStock,
    });
  };

  const handleResetFilters = () => {
    setPriceRange([0, 10000000]);
    setSelectedRating(null);
    setSelectedCategories([]);
    setInStock(true);
    onFilterChange({
      priceRange: [0, 10000000],
      rating: null,
      categories: [],
      inStock: true,
    });
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-4 text-sm">Khoảng giá</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={10000000}
            step={100000}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-4 text-sm">Danh mục</h3>
        <div className="space-y-3">
          {CATEGORIES.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <Label htmlFor={category} className="text-sm cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <h3 className="font-semibold mb-4 text-sm">Đánh giá</h3>
        <div className="space-y-2">
          {[5, 4, 3].map((rating) => (
            <button
              key={rating}
              onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
              className={`flex items-center gap-2 w-full p-2 rounded text-sm hover:bg-muted transition-colors ${
                selectedRating === rating ? "bg-muted" : ""
              }`}
            >
              <div className="flex">
                {Array(5).fill(0).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span>trở lên</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Stock */}
      <div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={inStock}
            onCheckedChange={(checked) => setInStock(checked as boolean)}
          />
          <Label htmlFor="inStock" className="text-sm cursor-pointer">
            Còn hàng
          </Label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-4">
        <Button onClick={handleApplyFilters} className="w-full">
          Áp dụng
        </Button>
        <Button onClick={handleResetFilters} variant="outline" className="w-full">
          Đặt lại
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;
