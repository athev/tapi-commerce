
import { useState } from "react";
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
  const urlCategory = urlParams.get('category') || '';

  // Use URL params if available
  const effectiveSearchTerm = urlSearchTerm || searchTerm;
  const effectiveCategory = urlCategory || activeCategory;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-1">
        <HeroBanner />
        
        <div className="bg-white py-8 shadow-sm">
          <FeaturedCategories 
            activeCategory={effectiveCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
        
        <section className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {effectiveCategory === "all" ? "Sản phẩm nổi bật" : `Danh mục: ${effectiveCategory}`}
            </h2>
            <p className="text-gray-600">
              Khám phá các sản phẩm số chất lượng cao từ những người bán uy tín
            </p>
          </div>
          
          <ProductGrid 
            searchTerm={effectiveSearchTerm}
            category={effectiveCategory}
          />
        </section>
        
        <SellerCTA />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
