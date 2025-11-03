
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
import { QuickHelpSection } from "@/components/home/QuickHelpSection";

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
        <div className="h-4 md:h-6" />

        <CategoryScroller />
        <div className="h-4 md:h-6" />

        {/* Flash Sale Section */}
        <section className="mb-4 md:mb-6">
          <div className="container mx-auto px-2 md:px-4">
            <div className="flex items-center justify-between mb-3 md:mb-6">
              <div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2">
                  <span className="text-2xl md:text-3xl">⚡</span>
                  Flash Sale Hôm Nay
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">
                  Săn deal hot - Số lượng có hạn!
                </p>
              </div>
            </div>
            <FlashSaleSection />
          </div>
        </section>
        
        {/* Product Grid */}
        <section className="bg-neutral-50 py-4 md:py-6 lg:py-8">
          <div className="container mx-auto px-2 md:px-4">
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
                <div className="mb-3 md:mb-6">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">
                    Sản Phẩm Nổi Bật
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">
                    Khám phá sản phẩm số chất lượng từ người bán uy tín
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

                <div className="mt-3 md:mt-6">
                  <ProductGrid 
                    searchTerm={effectiveSearchTerm}
                    category={effectiveCategory}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <QuickHelpSection />
        
        <SellerCTA />
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
