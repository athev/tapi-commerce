
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { mockCategories } from "@/lib/supabase";
import CategoryCard, { CategoryCardProps } from "../products/CategoryCard";
import { Link } from "react-router-dom";

const FeaturedCategories = () => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['featured-categories'],
    queryFn: async () => {
      try {
        console.log('Fetching categories...');
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (error) {
          console.warn('Categories fetch error:', error);
          throw error;
        }
        
        console.log('Categories fetched successfully:', data);
        return data.map(item => ({
          id: item.id,
          title: item.name,
          icon: item.icon || '/placeholder.svg',
          count: item.count || 0
        }));
      } catch (error) {
        console.warn('Error fetching featured categories, using mock data', error);
        
        return mockCategories.map(item => ({
          id: item.id,
          title: item.name,
          icon: item.icon,
          count: item.count
        }));
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
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
    console.error('Categories error:', error);
  }

  return (
    <section className="container py-12">
      <h2 className="text-2xl font-bold mb-8 text-center">Danh mục sản phẩm</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {categories?.map((category) => (
          <Link to={`/?category=${encodeURIComponent(category.title)}`} key={category.id}>
            <CategoryCard {...category} />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
