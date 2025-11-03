
import { useState } from "react";
import EnhancedNavbar from "@/components/layout/EnhancedNavbar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Footer from "@/components/layout/Footer";
import HeroCarousel from "@/components/home/HeroCarousel";
import CategoryScroller from "@/components/home/CategoryScroller";
import FlashSaleSection from "@/components/home/FlashSaleSection";
import ProductGrid from "@/components/products/ProductGrid";
import SellerCTA from "@/components/home/SellerCTA";
import ProductToolbar, { SortOption, ViewMode } from "@/components/products/ProductToolbar";
import FilterPanel from "@/components/products/FilterPanel";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filters, setFilters] = useState<any>(null);

  // Extract search params from URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlSearchTerm = urlParams.get('search') || '';
  const urlCategory = urlParams.get('category') || '';

  // Use URL params if available
  const effectiveSearchTerm = urlSearchTerm || searchTerm;
  const effectiveCategory = urlCategory || activeCategory;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-16 lg:pb-0">
      <EnhancedNavbar />
      
      <main className="flex-1">
        <HeroCarousel />
        
        <CategoryScroller />
        
        <FlashSaleSection />
        
        <section className="container mx-auto px-4 py-8">
          <div className="flex gap-6">
            {/* Desktop Filter Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-card border border-border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-4">Bộ lọc</h3>
                <FilterPanel onFilterChange={setFilters} />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {effectiveCategory === "all" ? "Sản phẩm nổi bật" : effectiveCategory}
                </h2>
                <p className="text-muted-foreground">
                  Khám phá các sản phẩm số chất lượng cao từ những người bán uy tín
                </p>
              </div>

              <ProductToolbar
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onFilterChange={setFilters}
                totalProducts={0}
              />

              <div className="mt-6">
                <ProductGrid 
                  searchTerm={effectiveSearchTerm}
                  category={effectiveCategory}
                />
              </div>
            </div>
          </div>
        </section>
        
        <SellerCTA />
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
