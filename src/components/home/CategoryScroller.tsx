import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mockCategories } from "@/lib/supabase";
import { ChevronRight, LayoutGrid, BookOpen, Smartphone, Palette, Code, Music, Video, Gamepad2, FileText, ShoppingBag } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  "Tất cả": LayoutGrid,
  "Ebook": BookOpen,
  "E-Book": BookOpen,
  "Khóa học": Video,
  "Software": Code,
  "Phần mềm": Code,
  "Template": Palette,
  "Biểu mẫu": FileText,
  "Plugin": Code,
  "Music": Music,
  "App": Smartphone,
  "Tài khoản": Smartphone,
  "Game & Key": Gamepad2,
  "Dịch vụ": ShoppingBag,
};

const CategoryScroller = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Tất cả");

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

  // Add "Tất cả" as first category
  const allCategories = [
    { id: 'all', name: 'Tất cả', icon: '', count: 0 },
    ...categories
  ];

  const handleCategoryClick = (categoryName: string) => {
    setActiveCategory(categoryName);
    if (categoryName === 'Tất cả') {
      navigate('/');
    } else {
      navigate(`/?category=${encodeURIComponent(categoryName)}`);
    }
  };

  return (
    <section className="bg-card py-4 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Danh Mục</h2>
          <button className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5 font-medium">
            Xem tất cả
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {allCategories.map((category) => {
              const IconComponent = categoryIcons[category.name] || BookOpen;
              const isActive = activeCategory === category.name;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                    isActive 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background hover:bg-muted border-border hover:border-primary/50'
                  }`}
                >
                  <IconComponent className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                  <span className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
};

export default CategoryScroller;
