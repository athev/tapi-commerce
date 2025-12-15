import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { X, Check, BookOpen, Code, Smartphone, Video, Palette, FileText, ShoppingBag, Music, Gamepad2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface Subcategory {
  id: string;
  parent_category_id: string;
  name: string;
  icon_url?: string;
}

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  "Ebook": BookOpen,
  "E-Book": BookOpen,
  "Khóa học": Video,
  "Phần mềm": Code,
  "Template": Palette,
  "Biểu mẫu": FileText,
  "Tài khoản AI": Smartphone,
  "Giải trí": Gamepad2,
  "Học tập": BookOpen,
  "Dịch vụ": ShoppingBag,
  "Âm nhạc": Music,
};

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoryModal = ({ isOpen, onClose }: CategoryModalProps) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-modal'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, icon')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch subcategories for selected category
  const { data: subcategories = [] } = useQuery({
    queryKey: ['subcategories', selectedCategory?.id],
    queryFn: async () => {
      if (!selectedCategory?.id) return [];
      
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('parent_category_id', selectedCategory.id)
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCategory?.id,
  });

  // Auto-select first category when modal opens
  useEffect(() => {
    if (isOpen && categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [isOpen, categories, selectedCategory]);

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory(null);
    }
  }, [isOpen]);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    navigate(`/?category=${encodeURIComponent(selectedCategory?.name || '')}&subcategory=${encodeURIComponent(subcategory.name)}`);
    onClose();
  };

  const handleViewAllCategory = () => {
    if (selectedCategory) {
      navigate(`/?category=${encodeURIComponent(selectedCategory.name)}`);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 pb-0 border-b-0">
          <DialogTitle className="text-lg font-bold text-foreground">
            Danh Mục Sản Phẩm
          </DialogTitle>
        </DialogHeader>

        {/* Yellow Banner */}
        <div className="bg-amber-50 border-y border-amber-200 py-2.5 px-4 flex items-center gap-2">
          <Check className="h-4 w-4 text-amber-600" />
          <span className="text-sm text-amber-700 font-medium">
            30 ngày đổi ý & miễn phí trả hàng
          </span>
        </div>

        {/* Content - 2 Columns */}
        <div className="flex min-h-[350px]">
          {/* Left Sidebar - Categories */}
          <div className="w-[140px] md:w-[160px] border-r border-border bg-muted/30 flex-shrink-0">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.name] || BookOpen;
              const isActive = selectedCategory?.id === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`w-full flex items-center gap-2.5 px-3 py-3 text-left transition-all ${
                    isActive 
                      ? 'bg-background border-l-2 border-primary text-primary font-medium' 
                      : 'text-foreground hover:bg-background/50'
                  }`}
                >
                  <IconComponent className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm truncate">{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right Content - Subcategories */}
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedCategory && (
              <>
                {/* Breadcrumb */}
                <div className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
                  <button 
                    onClick={handleViewAllCategory}
                    className="text-primary hover:underline"
                  >
                    {selectedCategory.name}
                  </button>
                  <span>&gt;</span>
                  <span>Tất cả</span>
                </div>

                {/* Subcategories Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {subcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      onClick={() => handleSubcategoryClick(subcategory)}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border bg-background hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      {/* Subcategory Icon - placeholder square */}
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        {subcategory.icon_url ? (
                          <img 
                            src={subcategory.icon_url} 
                            alt={subcategory.name}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground">
                            {subcategory.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-center text-foreground group-hover:text-primary font-medium">
                        {subcategory.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Empty state */}
                {subcategories.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Chưa có danh mục con</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryModal;
