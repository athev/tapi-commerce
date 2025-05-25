
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, mockProducts } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/home/HeroBanner";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import ProductGrid from "@/components/products/ProductGrid";
import SellerCTA from "@/components/home/SellerCTA";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Extract search params from URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlSearchTerm = urlParams.get('search') || '';

  // Use URL search term if available
  const effectiveSearchTerm = urlSearchTerm || searchTerm;

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', activeCategory, effectiveSearchTerm],
    queryFn: async () => {
      console.log('Fetching products with filters:', { activeCategory, searchTerm: effectiveSearchTerm });
      
      try {
        let query = supabase.from('products').select('*');
        
        if (activeCategory !== 'all') {
          query = query.eq('category', activeCategory);
        }
        
        if (effectiveSearchTerm) {
          query = query.or(`title.ilike.%${effectiveSearchTerm}%,description.ilike.%${effectiveSearchTerm}%`);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Fetched products from Supabase:', data);
        return data || [];
      } catch (error) {
        console.error('Error fetching products:', error);
        console.log('Falling back to mock products...');
        
        // Fallback to mock data
        let filteredProducts = mockProducts;
        
        if (activeCategory !== 'all') {
          filteredProducts = filteredProducts.filter(product => product.category === activeCategory);
        }
        
        if (effectiveSearchTerm) {
          filteredProducts = filteredProducts.filter(product => 
            product.title.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(effectiveSearchTerm.toLowerCase())
          );
        }
        
        return filteredProducts;
      }
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <HeroBanner />
        <FeaturedCategories 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        <ProductGrid 
          products={products || []}
          isLoading={isLoading}
          error={error}
        />
        <SellerCTA />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
