import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Check, Monitor, User, Gamepad2, GraduationCap, FileText, BookOpen, Music, Briefcase } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import EnhancedProductCard from "@/components/products/EnhancedProductCard";
import { Skeleton } from "@/components/ui/skeleton";

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

interface Product {
  id: string;
  title: string;
  price: number;
  image: string | null;
  category: string;
  seller_name: string;
  seller_id: string;
  average_rating: number | null;
  review_count: number | null;
  purchases: number | null;
  warranty_period: string | null;
  in_stock: number | null;
}

// Icon mapping for categories - matching reference design
const categoryIcons: Record<string, any> = {
  "Phần mềm": Monitor,
  "Tài khoản": User,
  "Tài khoản AI": User,
  "Game & Key": Gamepad2,
  "Giải trí": Gamepad2,
  "Khóa học": GraduationCap,
  "Học tập": GraduationCap,
  "Biểu mẫu": FileText,
  "Template": FileText,
  "E-Book": BookOpen,
  "Ebook": BookOpen,
  "Âm nhạc": Music,
  "Dịch vụ": Briefcase,
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
  const { data: subcategories = [], isLoading: loadingSubcategories } = useQuery({
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

  // Always fetch products for selected category
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['category-products', selectedCategory?.name],
    queryFn: async () => {
      if (!selectedCategory?.name) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('id, title, price, image, category, seller_name, seller_id, average_rating, review_count, purchases, warranty_period, in_stock')
        .eq('category', selectedCategory.name)
        .eq('status', 'active')
        .order('quality_score', { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCategory?.name,
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
    navigate(`/search?category=${encodeURIComponent(selectedCategory?.name || '')}&subcategory=${encodeURIComponent(subcategory.name)}`);
    onClose();
  };

  const handleViewAllCategory = () => {
    if (selectedCategory) {
      navigate(`/search?category=${encodeURIComponent(selectedCategory.name)}`);
      onClose();
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  const isLoading = loadingSubcategories;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-2xl">
        {/* Header */}
        <div className="flex items-center justify-center px-4 py-3 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Danh Mục Sản Phẩm</h2>
        </div>

        {/* Yellow Banner */}
        <div className="bg-amber-50 py-2 px-4 flex items-center justify-center gap-2">
          <Check className="h-4 w-4 text-amber-600" />
          <span className="text-sm text-amber-700 font-medium">
            30 ngày đổi ý & miễn phí trả hàng
          </span>
        </div>

        {/* Content - 2 Columns */}
        <div className="flex h-[calc(85vh-100px)] overflow-hidden">
          {/* Left Sidebar - Categories */}
          <div className="w-20 md:w-24 border-r border-border bg-muted/30 flex-shrink-0 overflow-y-auto">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.name] || Monitor;
              const isActive = selectedCategory?.id === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`w-full flex flex-col items-center gap-1.5 px-2 py-3 text-center transition-all border-l-2 ${
                    isActive 
                      ? 'bg-background border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:bg-background/50'
                  }`}
                >
                  <IconComponent className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-medium leading-tight">{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right Content - Subcategories or Products */}
          <div className="flex-1 overflow-y-auto">
            {selectedCategory && (
              <>
                {/* Breadcrumb */}
                <div className="sticky top-0 bg-background z-10 text-sm text-muted-foreground p-3 border-b border-border flex items-center gap-1">
                  <button 
                    onClick={handleViewAllCategory}
                    className="font-semibold text-foreground hover:text-primary"
                  >
                    {selectedCategory.name}
                  </button>
                  <span className="text-muted-foreground">&gt;</span>
                  <span>Tất cả</span>
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="p-3 grid grid-cols-3 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 p-3">
                        <Skeleton className="w-14 h-14 rounded-lg" />
                        <Skeleton className="w-16 h-3" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Subcategories Grid */}
                {!isLoading && subcategories.length > 0 && (
                  <div className="p-3 grid grid-cols-3 gap-3">
                    {subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => handleSubcategoryClick(subcategory)}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-all group"
                      >
                        {/* Subcategory Icon */}
                        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          {subcategory.icon_url ? (
                            <img 
                              src={subcategory.icon_url} 
                              alt={subcategory.name}
                              className="w-10 h-10 object-contain"
                            />
                          ) : (
                            <span className="text-xl font-bold text-primary">
                              {subcategory.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-center text-foreground font-medium line-clamp-2">
                          {subcategory.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Products Grid - Always show */}
                {!isLoading && products.length > 0 && (
                  <>
                    <div className="px-3 pt-3 pb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Sản phẩm nổi bật</span>
                      <button 
                        onClick={handleViewAllCategory}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        Xem tất cả →
                      </button>
                    </div>
                    <div className="p-3 pt-1 grid grid-cols-2 gap-2">
                      {products.map((product) => (
                        <div key={product.id} onClick={() => handleProductClick(product.id)}>
                          <EnhancedProductCard
                            id={product.id}
                            title={product.title}
                            price={{ min: product.price, max: product.price }}
                            image={product.image || '/placeholder.svg'}
                            category={product.category}
                            rating={product.average_rating || 0}
                            reviews={product.review_count || 0}
                            seller={{ name: product.seller_name, verified: false }}
                            averageRating={product.average_rating || 0}
                            reviewCount={product.review_count || 0}
                            soldCount={product.purchases || 0}
                            warrantyPeriod={product.warranty_period || undefined}
                            inStock={product.in_stock || 0}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Loading products */}
                {!isLoading && loadingProducts && (
                  <div className="p-3 grid grid-cols-2 gap-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                )}

                {/* Empty state - no products */}
                {!isLoading && !loadingProducts && products.length === 0 && (
                  <div className="text-center py-12 px-4 text-muted-foreground">
                    <Monitor className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Chưa có sản phẩm trong danh mục này</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CategoryModal;
