
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mockCategories } from "@/lib/supabase";
import CategoryCard, { CategoryCardProps } from "../products/CategoryCard";
import { Link } from "react-router-dom";

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
    <section className="container py-12">
      <h2 className="text-2xl font-bold mb-8 text-center">Danh mục sản phẩm</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {displayCategories.map((category) => (
          <div 
            key={category.id} 
            onClick={() => onCategoryChange(category.title)}
            className="cursor-pointer"
          >
            <CategoryCard {...category} />
          </div>
        ))}
      </div>
      {displayCategories.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Không có danh mục nào để hiển thị</p>
        </div>
      )}
    </section>
  );
};

export default FeaturedCategories;
