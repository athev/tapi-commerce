
import { useQuery } from "@tanstack/react-query";
import { supabase, mockCategories } from "@/lib/supabase";
import CategoryCard, { CategoryCardProps } from "../products/CategoryCard";
import { Link } from "react-router-dom";

const FeaturedCategories = () => {
  const { data: categories } = useQuery({
    queryKey: ['featured-categories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
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
    }
  });

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
