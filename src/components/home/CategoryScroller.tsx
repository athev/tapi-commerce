import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mockCategories } from "@/lib/supabase";
import { ChevronRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

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
          <div className="flex gap-4 pb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.name)}
                className="flex-shrink-0 w-28 group"
              >
                <div className="bg-card border border-border rounded-lg p-4 transition-all hover:shadow-md hover:border-primary hover:-translate-y-1">
                  <div className="w-16 h-16 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-10 h-10 object-contain group-hover:brightness-0 group-hover:invert transition-all"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <p className="text-xs font-medium text-center text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground text-center">
                    {category.count} sản phẩm
                  </p>
                </div>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default CategoryScroller;
