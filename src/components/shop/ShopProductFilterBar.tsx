import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SortOption = "popular" | "newest" | "bestselling" | "price_asc" | "price_desc";

interface ShopProductFilterBarProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const ShopProductFilterBar = ({ sortBy, onSortChange }: ShopProductFilterBarProps) => {
  const filters: { key: SortOption; label: string }[] = [
    { key: "popular", label: "Phổ biến" },
    { key: "newest", label: "Mới nhất" },
    { key: "bestselling", label: "Bán chạy" },
  ];

  const isPriceSort = sortBy === "price_asc" || sortBy === "price_desc";
  const priceLabel = sortBy === "price_asc" ? "Giá ↑" : sortBy === "price_desc" ? "Giá ↓" : "Giá";

  return (
    <div className="sticky top-0 z-10 bg-card border-b">
      <div className="flex items-center px-4 overflow-x-auto no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onSortChange(filter.key)}
            className={cn(
              "px-4 py-3 text-sm whitespace-nowrap transition-colors relative",
              sortBy === filter.key
                ? "text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {filter.label}
            {sortBy === filter.key && (
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-t" />
            )}
          </button>
        ))}
        
        {/* Price Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "px-4 py-3 text-sm whitespace-nowrap transition-colors relative flex items-center gap-1",
                isPriceSort
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {priceLabel}
              <ChevronDown className="h-3 w-3" />
              {isPriceSort && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-t" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[120px]">
            <DropdownMenuItem 
              onClick={() => onSortChange("price_asc")}
              className={cn(sortBy === "price_asc" && "text-primary font-medium")}
            >
              Giá: Thấp đến Cao
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onSortChange("price_desc")}
              className={cn(sortBy === "price_desc" && "text-primary font-medium")}
            >
              Giá: Cao đến Thấp
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ShopProductFilterBar;