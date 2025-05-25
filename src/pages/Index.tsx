
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

  // Use URL search term if available
  const effectiveSearchTerm = urlSearchTerm || searchTerm;

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
          searchTerm={effectiveSearchTerm}
          category={activeCategory}
        />
        <SellerCTA />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
