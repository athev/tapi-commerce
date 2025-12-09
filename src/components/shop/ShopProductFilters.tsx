import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGrid, List, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortOption = "popular" | "newest" | "bestselling" | "price-asc" | "price-desc";
export type ViewMode = "grid-2" | "grid-3" | "grid-4" | "list";

interface ShopProductFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalProducts: number;
}

const ShopProductFilters = ({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalProducts
}: ShopProductFiltersProps) => {
  
  const sortOptions = [
    { value: "popular", label: "Phổ biến" },
    { value: "newest", label: "Mới nhất" },
    { value: "bestselling", label: "Bán chạy" },
    { value: "price-asc", label: "Giá: Thấp → Cao" },
    { value: "price-desc", label: "Giá: Cao → Thấp" }
  ];

  const viewModes = [
    { value: "grid-2" as ViewMode, icon: Grid3X3, label: "2 cột" },
    { value: "grid-3" as ViewMode, icon: LayoutGrid, label: "3 cột" },
    { value: "grid-4" as ViewMode, icon: LayoutGrid, label: "4 cột" },
  ];

  return (
    <div className="mx-4 md:mx-8 mt-4">
      <div className="bg-card rounded-lg border shadow-sm p-3 md:p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left Side - Category & Sort */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Category Filter */}
            <Select 
              value={selectedCategory} 
              onValueChange={onCategoryChange}
            >
              <SelectTrigger className="w-[140px] md:w-[160px] h-9">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select 
              value={sortBy} 
              onValueChange={(value) => onSortChange(value as SortOption)}
            >
              <SelectTrigger className="w-[140px] md:w-[160px] h-9">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Results Count */}
            <span className="text-sm text-muted-foreground hidden md:inline">
              Hiển thị <strong>{totalProducts}</strong> sản phẩm
            </span>
          </div>

          {/* Right Side - View Mode Toggle (Desktop Only) */}
          <div className="hidden md:flex items-center gap-1 bg-muted/50 rounded-md p-1">
            {viewModes.map((mode) => (
              <Button
                key={mode.value}
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange(mode.value)}
                className={cn(
                  "h-8 px-3",
                  viewMode === mode.value 
                    ? "bg-background shadow-sm" 
                    : "hover:bg-background/50"
                )}
              >
                <mode.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>

        {/* Mobile Results Count */}
        <div className="mt-2 md:hidden">
          <span className="text-sm text-muted-foreground">
            Hiển thị <strong>{totalProducts}</strong> sản phẩm
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShopProductFilters;
