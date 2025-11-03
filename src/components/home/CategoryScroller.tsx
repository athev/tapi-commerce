import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mockCategories } from "@/lib/supabase";
import { ChevronRight, BookOpen, Smartphone, Palette, Code, Music, Video } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  "Ebook": BookOpen,
  "Khóa học": Video,
  "Software": Code,
  "Template": Palette,
  "Plugin": Code,
  "Music": Music,
  "App": Smartphone,
};

const CategoryScroller = () => {
  const navigate = useNavigate();

  const { data: categories } = useQuery({
    queryKey: ['categories-scroller'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error || !data || data.length === 0) {
        return mockCategories;
      }
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        icon: item.icon || '/placeholder.svg',
        count: item.count || 0
      }));
    },
    initialData: mockCategories,
  });

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="bg-background py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Danh Mục</h2>
          <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
            Xem tất cả
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-2 md:gap-4 pb-4">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.name] || BookOpen;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.name)}
                  className="flex-shrink-0 w-20 md:w-28 group"
                >
                  <div className="bg-card border border-border rounded-lg p-2 md:p-4 transition-all hover:shadow-md hover:border-primary hover:-translate-y-1">
                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-1 md:mb-2 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                      <IconComponent className="h-6 w-6 md:h-10 md:w-10 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <p className="text-[10px] md:text-xs font-medium text-center text-foreground line-clamp-2 mb-0.5 md:mb-1 group-hover:text-primary transition-colors leading-tight">
                      {category.name}
                    </p>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground text-center">
                      {category.count}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default CategoryScroller;
