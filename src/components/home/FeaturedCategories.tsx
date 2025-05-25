
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
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name')
          .abortSignal(controller.signal);
        
        clearTimeout(timeoutId);
        console.log('📊 Supabase categories response:', { data, error });
        
        if (error) {
          console.error('❌ Categories fetch error:', error);
          console.log('🔄 Falling back to mock data...');
          return mockCategories.map(item => ({
            id: item.id,
            title: item.name,
            icon: item.icon,
            count: item.count
          }));
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
    retry: false, // Disable retry to prevent hanging
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  console.log('🎯 FeaturedCategories render state:', { isLoading, error, categoriesCount: categories?.length });

  if (isLoading) {
    console.log('⏳ Categories loading...');
    return (
      <section className="container py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Danh mục sản phẩm</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    console.error('❌ Categories error in render:', error);
  }

  // Always render categories, either from Supabase or mock data
  return (
    <section className="container py-12">
      <h2 className="text-2xl font-bold mb-8 text-center">Danh mục sản phẩm</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {categories?.map((category) => (
          <div 
            key={category.id} 
            onClick={() => onCategoryChange(category.title)}
            className="cursor-pointer"
          >
            <CategoryCard {...category} />
          </div>
        ))}
      </div>
      {categories?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Không có danh mục nào để hiển thị</p>
        </div>
      )}
    </section>
  );
};

export default FeaturedCategories;
