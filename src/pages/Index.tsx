import { useState } from "react";
import EnhancedNavbar from "@/components/layout/EnhancedNavbar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Footer from "@/components/layout/Footer";
import HeroSearchSection from "@/components/home/HeroSearchSection";
import HomeVouchersSection from "@/components/home/HomeVouchersSection";
import TrustBanner from "@/components/home/TrustBanner";
import FeaturedBanner from "@/components/home/FeaturedBanner";
import CategoryScroller from "@/components/home/CategoryScroller";
import TopDealSection from "@/components/home/TopDealSection";
import ProductGrid from "@/components/products/ProductGrid";
import ProductToolbar, { SortOption, ViewMode } from "@/components/products/ProductToolbar";
import FilterPanel, { FilterState } from "@/components/products/FilterPanel";

const Index = () => {
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filters, setFilters] = useState<FilterState | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 pb-16 lg:pb-0">
      <EnhancedNavbar />
      
      <main className="flex-1">
        {/* Hero Search */}
        <HeroSearchSection />

        {/* Vouchers Section */}
        <HomeVouchersSection />

        {/* Trust Banner */}
        <TrustBanner />

        {/* Featured Banner - Best Seller */}
        <FeaturedBanner />

        {/* Categories */}
        <CategoryScroller />

        {/* Top Deal Section */}
        <TopDealSection />
        
        {/* Product Grid Section */}
        <section className="py-4 md:py-6">
          <div className="container mx-auto px-4">
            <div className="flex gap-6">
              {/* Desktop Filter Sidebar */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24 bg-card border border-border rounded-lg p-4">
                  <h3 className="font-bold text-base mb-4">Bộ lọc</h3>
                  <FilterPanel onFilterChange={setFilters} />
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="bg-card rounded-lg border border-border p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-foreground">
                        Sản Phẩm Nổi Bật
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Khám phá sản phẩm số chất lượng từ người bán uy tín
                      </p>
                    </div>
                  </div>

                  <ProductToolbar
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onFilterChange={setFilters}
                    totalProducts={0}
                  />
                </div>

                <ProductGrid sortBy={sortBy} filters={filters} />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
