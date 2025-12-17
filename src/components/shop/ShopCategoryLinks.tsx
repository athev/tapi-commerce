import { useState, useEffect } from "react";
import { 
  Monitor, 
  User, 
  Gamepad2, 
  GraduationCap, 
  FileText, 
  BookOpen,
  Layers,
  Package
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ShopCategoryLinksProps {
  sellerId: string;
  onCategoryClick?: (category: string) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  "Phần mềm": <Monitor className="h-5 w-5" />,
  "Tài khoản": <User className="h-5 w-5" />,
  "Game & Key": <Gamepad2 className="h-5 w-5" />,
  "Khóa học": <GraduationCap className="h-5 w-5" />,
  "Biểu mẫu": <FileText className="h-5 w-5" />,
  "E-Book": <BookOpen className="h-5 w-5" />,
  "Template": <Layers className="h-5 w-5" />,
};

const ShopCategoryLinks = ({ sellerId, onCategoryClick }: ShopCategoryLinksProps) => {
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data: products } = await supabase
        .from('products')
        .select('category')
        .eq('seller_id', sellerId)
        .eq('status', 'active');

      if (products) {
        // Count products per category
        const categoryMap = new Map<string, number>();
        products.forEach(p => {
          const count = categoryMap.get(p.category) || 0;
          categoryMap.set(p.category, count + 1);
        });

        const uniqueCategories = Array.from(categoryMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        setCategories(uniqueCategories);
      }
    };

    fetchCategories();
  }, [sellerId]);

  const handleClick = (category: string) => {
    const newSelected = selectedCategory === category ? null : category;
    setSelectedCategory(newSelected);
    onCategoryClick?.(newSelected || '');
  };

  if (categories.length === 0) return null;

  return (
    <div className="bg-card rounded-lg p-3">
      <h3 className="text-sm font-semibold text-foreground mb-3">Danh mục sản phẩm</h3>
      
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => handleClick(category.name)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-2.5 rounded-lg min-w-[70px] transition-all",
              selectedCategory === category.name
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-foreground"
            )}
          >
            <div className={cn(
              "p-2 rounded-full",
              selectedCategory === category.name
                ? "bg-primary-foreground/20"
                : "bg-background"
            )}>
              {categoryIcons[category.name] || <Package className="h-5 w-5" />}
            </div>
            <span className="text-xs font-medium text-center line-clamp-1">
              {category.name}
            </span>
            <span className={cn(
              "text-[10px]",
              selectedCategory === category.name
                ? "text-primary-foreground/80"
                : "text-muted-foreground"
            )}>
              {category.count} SP
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShopCategoryLinks;
