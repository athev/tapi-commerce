import { useSearchParams } from "react-router-dom";
import EnhancedNavbar from "@/components/layout/EnhancedNavbar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Footer from "@/components/layout/Footer";
import ProductGrid from "@/components/products/ProductGrid";
import ProductToolbar, { SortOption, ViewMode } from "@/components/products/ProductToolbar";
import FilterPanel from "@/components/products/FilterPanel";
import { useState, useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Search } from "lucide-react";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';
  
  const [sortBy, setSortBy] = useState<SortOption>(searchQuery ? "relevance" : "newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filters, setFilters] = useState<any>(null);

  // Reset to relevance when search query changes
  useEffect(() => {
    if (searchQuery) {
      setSortBy("relevance");
    }
  }, [searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-16 lg:pb-0">
      <EnhancedNavbar />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-3">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Tìm kiếm</BreadcrumbPage>
                </BreadcrumbItem>
                {searchQuery && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-semibold">{searchQuery}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Search Summary Bar */}
        <div className="bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold">
                  Kết quả tìm kiếm cho: <span className="text-primary">"{searchQuery}"</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Khám phá sản phẩm phù hợp với nhu cầu của bạn
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <section className="py-6 lg:py-8">
          <div className="container mx-auto px-4">
            <div className="flex gap-6">
              {/* Desktop Filter Sidebar */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24 bg-card border border-border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-4">Bộ lọc</h3>
                  <FilterPanel onFilterChange={setFilters} />
                </div>
              </aside>

              {/* Product Grid */}
              <div className="flex-1 min-w-0">
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
                    searchTerm={searchQuery}
                    category={categoryParam}
                    sortBy={sortBy}
                  />
                </div>
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

export default SearchResults;
