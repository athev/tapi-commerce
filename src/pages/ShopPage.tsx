import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Helmet } from 'react-helmet-async';
import { supabase } from "@/integrations/supabase/client";
import EnhancedNavbar from "@/components/layout/EnhancedNavbar";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ShopHeader from "@/components/shop/ShopHeader";
import ShopStatsBar from "@/components/shop/ShopStatsBar";
import ShopTabsNavigation, { type ShopTab } from "@/components/shop/ShopTabsNavigation";
import ShopProductFilters, { type SortOption, type ViewMode } from "@/components/shop/ShopProductFilters";
import ShopProductGrid from "@/components/shop/ShopProductGrid";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const ShopPage = () => {
  const { slug, id, sellerId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState<ShopTab>("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [viewMode, setViewMode] = useState<ViewMode>("grid-4");

  useEffect(() => {
    document.title = "Gian hàng | DigitalMarket";
    
    const fetchShopData = async () => {
      const identifier = slug || id || sellerId;
      if (!identifier) return;

      try {
        const isUUID = identifier?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        
        let sellerQuery = supabase.from('profiles').select('*');
        if (isUUID) {
          sellerQuery = sellerQuery.eq('id', identifier);
        } else {
          sellerQuery = sellerQuery.eq('slug', identifier);
        }

        const { data: sellerData, error: sellerError } = await sellerQuery.single();

        if (sellerError) throw sellerError;
        setSeller(sellerData);
        
        if (sellerData) {
          document.title = `${sellerData.full_name} - DigitalMarket`;
        }

        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', sellerData.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        setProducts(productsData || []);

      } catch (error: any) {
        console.error('Error fetching shop data:', error);
        toast.error("Không thể tải thông tin gian hàng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopData();
  }, [slug, id, sellerId]);

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return cats.filter(Boolean);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by tab
    if (activeTab === "bestsellers") {
      filtered = filtered.filter(p => (p.purchases || 0) > 0);
      filtered.sort((a, b) => (b.purchases || 0) - (a.purchases || 0));
    } else if (activeTab === "new") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "bestselling":
        filtered.sort((a, b) => (b.purchases || 0) - (a.purchases || 0));
        break;
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "popular":
      default:
        filtered.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));
        break;
    }

    return filtered;
  }, [products, activeTab, selectedCategory, sortBy]);

  // Calculate reviews count
  const reviewsCount = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.review_count || 0), 0);
  }, [products]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/30">
        <EnhancedNavbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/30">
        <EnhancedNavbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Không tìm thấy gian hàng</h2>
            <p className="text-muted-foreground">Gian hàng này không tồn tại hoặc đã bị xóa.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <Helmet>
        <title>{seller.full_name} - Cửa hàng DigitalMarket</title>
        <meta name="description" content={seller.shop_description || `Xem các sản phẩm từ ${seller.full_name}`} />
        <meta property="og:title" content={`${seller.full_name} - Cửa hàng DigitalMarket`} />
        <meta property="og:description" content={seller.shop_description || `Xem các sản phẩm từ ${seller.full_name}`} />
        <meta property="og:image" content={seller.avatar || seller.shop_banner || '/placeholder.svg'} />
        <meta property="og:url" content={`${window.location.origin}/shop/${seller.slug || seller.id}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${seller.full_name} - Cửa hàng DigitalMarket`} />
        <meta name="twitter:description" content={seller.shop_description || `Xem các sản phẩm từ ${seller.full_name}`} />
        <meta name="twitter:image" content={seller.avatar || seller.shop_banner || '/placeholder.svg'} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            "name": seller.full_name,
            "description": seller.shop_description,
            "image": seller.avatar || seller.shop_banner,
            "url": `${window.location.origin}/shop/${seller.slug || seller.id}`,
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": seller.seller_rating || 5,
              "reviewCount": reviewsCount || 1
            }
          })}
        </script>
      </Helmet>
      
      <EnhancedNavbar />
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Shop Header with Banner */}
        <ShopHeader seller={seller} />
        
        {/* Stats Bar */}
        <ShopStatsBar 
          seller={seller} 
          productsCount={products.length}
          reviewsCount={reviewsCount}
        />
        
        {/* Tabs Navigation */}
        <ShopTabsNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          productsCount={products.length}
        />
        
        {/* Filters */}
        <ShopProductFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalProducts={filteredProducts.length}
        />
        
        {/* Products Grid */}
        <ShopProductGrid 
          products={filteredProducts}
          viewMode={viewMode}
        />
      </main>

      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default ShopPage;
