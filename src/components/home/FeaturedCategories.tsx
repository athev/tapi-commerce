
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mockCategories } from "@/lib/supabase";
import CategoryCard, { CategoryCardProps } from "../products/CategoryCard";

interface FeaturedCategoriesProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const FeaturedCategories = ({ activeCategory, onCategoryChange }: FeaturedCategoriesProps) => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['featured-categories'],
    queryFn: async () => {
      try {
        console.log('🔍 Fetching categories from Supabase...');
        
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        console.log('📊 Supabase categories response:', { data, error });
        
        if (error) {
          console.error('❌ Categories fetch error:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.warn('⚠️ No categories found in database, using mock data');
          return mockCategories.map(item => ({
            id: item.id,
            title: item.name,
            icon: item.icon,
            count: item.count
          }));
        }
        
        console.log('✅ Categories fetched successfully:', data);
        return data.map(item => ({
          id: item.id,
          title: item.name,
          icon: item.icon || '/placeholder.svg',
          count: item.count || 0
        }));
      } catch (error) {
        console.error('💥 Exception in fetchCategories:', error);
        console.log('🔄 Using mock data as fallback...');
        
        return mockCategories.map(item => ({
          id: item.id,
          title: item.name,
          icon: item.icon,
          count: item.count
        }));
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  console.log('🎯 FeaturedCategories render state:', { isLoading, error, categoriesCount: categories?.length });

  // Always show categories, even if loading - use mock data immediately
  const displayCategories = categories || mockCategories.map(item => ({
    id: item.id,
    title: item.name,
    icon: item.icon,
    count: item.count
  }));

  return (
    <section className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Danh mục sản phẩm</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Khám phá các danh mục sản phẩm số đa dạng, từ ebook, khóa học đến template và phần mềm
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {displayCategories.map((category) => (
          <div 
            key={category.id} 
            onClick={() => onCategoryChange(category.title)}
            className={`cursor-pointer transition-all duration-200 ${
              activeCategory === category.title 
                ? 'transform scale-105' 
                : 'hover:transform hover:scale-105'
            }`}
          >
            <CategoryCard 
              {...category} 
              isActive={activeCategory === category.title}
            />
          </div>
        ))}
      </div>
      
      {displayCategories.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-500">Không có danh mục nào để hiển thị</p>
        </div>
      )}
    </section>
  );
};

export default FeaturedCategories;
