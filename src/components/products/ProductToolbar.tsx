import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, Grid3x3, List } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import FilterPanel from "./FilterPanel";

export type SortOption = "recommended" | "trending" | "relevance" | "newest" | "price_asc" | "price_desc" | "popular" | "rating";
export type ViewMode = "grid" | "list";

interface ProductToolbarProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onFilterChange: (filters: any) => void;
  totalProducts: number;
}

const ProductToolbar = ({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onFilterChange,
  totalProducts,
}: ProductToolbarProps) => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  return (
    <div className="bg-background border-y border-border py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Filter Button & Product Count */}
        <div className="flex items-center gap-4">
          {/* Mobile Filter */}
          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Lọc
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Bộ lọc</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterPanel onFilterChange={onFilterChange} />
              </div>
            </SheetContent>
          </Sheet>

          <span className="text-sm text-muted-foreground hidden sm:block">
            <span className="font-medium text-foreground">{totalProducts}</span> sản phẩm
          </span>
        </div>

        {/* Right: Sort & View Mode */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2 hidden sm:block">Sắp xếp:</span>
          
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">🌟 Đề xuất</SelectItem>
              <SelectItem value="trending">🔥 Xu hướng</SelectItem>
              <SelectItem value="relevance">Độ liên quan</SelectItem>
              <SelectItem value="newest">Mới nhất</SelectItem>
              <SelectItem value="popular">Bán chạy</SelectItem>
              <SelectItem value="price_asc">Giá thấp → cao</SelectItem>
              <SelectItem value="price_desc">Giá cao → thấp</SelectItem>
              <SelectItem value="rating">Đánh giá cao</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="hidden md:flex border border-border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => onViewModeChange("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-l-none border-l"
              onClick={() => onViewModeChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductToolbar;
