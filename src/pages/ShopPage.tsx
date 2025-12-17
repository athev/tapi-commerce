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
import ShopVouchersSection from "@/components/shop/ShopVouchersSection";
import ShopFeaturedCarousel from "@/components/shop/ShopFeaturedCarousel";
import ShopProfileTab from "@/components/shop/ShopProfileTab";
import ShopProductGrid from "@/components/shop/ShopProductGrid";
import ShopProductFilterBar, { type SortOption } from "@/components/shop/ShopProductFilterBar";
import ShopHeroBannerCarousel from "@/components/shop/ShopHeroBannerCarousel";
import ShopFlashDealBanner from "@/components/shop/ShopFlashDealBanner";
import ShopCategoryLinks from "@/components/shop/ShopCategoryLinks";
import ShopFeaturedGrid from "@/components/shop/ShopFeaturedGrid";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
const ShopPage = () => {
  const {
    slug,
    id,
    sellerId
  } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState<ShopTab>("home");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
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
        const {
          data: sellerData,
          error: sellerError
        } = await sellerQuery.single();
        if (sellerError) throw sellerError;
        setSeller(sellerData);
        if (sellerData) {
          document.title = `${sellerData.full_name} - DigitalMarket`;
        }
        const {
          data: productsData,
          error: productsError
        } = await supabase.from('products').select('*').eq('seller_id', sellerData.id).eq('status', 'active').order('created_at', {
          ascending: false
        });
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

  // Sorted products for product tab
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case "bestselling":
        return sorted.sort((a, b) => (b.purchases || 0) - (a.purchases || 0));
      case "price_asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price_desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "popular":
      default:
        return sorted.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));
    }
  }, [products, sortBy]);
  if (isLoading) {
    return <div className="flex flex-col min-h-screen bg-muted/30">
        <EnhancedNavbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>;
  }
  if (!seller) {
    return <div className="flex flex-col min-h-screen bg-muted/30">
        <EnhancedNavbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Không tìm thấy gian hàng</h2>
            <p className="text-muted-foreground">Gian hàng này không tồn tại hoặc đã bị xóa.</p>
          </div>
        </main>
        <Footer />
      </div>;
  }
  return <div className="flex flex-col min-h-screen bg-muted/30">
      <Helmet>
        <title>{seller.full_name} - Cửa hàng DigitalMarket</title>
        <meta name="description" content={seller.shop_description || `Xem các sản phẩm từ ${seller.full_name}`} />
        <meta property="og:title" content={`${seller.full_name} - Cửa hàng DigitalMarket`} />
        <meta property="og:description" content={seller.shop_description || `Xem các sản phẩm từ ${seller.full_name}`} />
        <meta property="og:image" content={seller.avatar || seller.shop_banner || '/placeholder.svg'} />
      </Helmet>
      
      <EnhancedNavbar />
      
      <main className="flex-1 pb-20 md:pb-0 bg-muted/50">
        {/* Container for desktop */}
        <div className="max-w-6xl mx-auto">
          {/* Shop Header */}
          <div className="bg-card">
            <ShopHeader seller={seller} />
          </div>
          
          {/* Stats Bar - Compact with separation */}
          <ShopStatsBar productsCount={products.length} rating={seller.seller_rating} responseRate={seller.response_rate} className="py-0 rounded-none border-none mx-[4px] my-[3px]" />
          
          {/* Tabs Navigation */}
          <div className="bg-card my-0 py-px">
            <ShopTabsNavigation activeTab={activeTab} onTabChange={setActiveTab} className="mx-0 my-0 py-px" />
          </div>
          
          {/* Tab Content with spacing */}
          <div className="space-y-2 mt-2 mx-0 px-0 my-0 py-0">
            {activeTab === "home" && <>
                {/* Hero Banner Carousel */}
                <div className="px-2">
                  <ShopHeroBannerCarousel 
                    shopBanner={seller.shop_banner}
                    shopName={seller.full_name}
                    shopDescription={seller.shop_description}
                  />
                </div>
                
                {/* Vouchers */}
                <ShopVouchersSection sellerId={seller.id} />
                
                {/* Flash Deal Banner */}
                <div className="px-2">
                  <ShopFlashDealBanner sellerId={seller.id} />
                </div>
                
                {/* Category Links */}
                <div className="px-2">
                  <ShopCategoryLinks 
                    sellerId={seller.id} 
                    onCategoryClick={(cat) => {
                      if (cat) {
                        setActiveTab("products");
                      }
                    }}
                  />
                </div>
                
                {/* Featured Products Carousels */}
                <div className="bg-card">
                  <ShopFeaturedCarousel 
                    products={[...products].sort((a, b) => (b.purchases || 0) - (a.purchases || 0))} 
                    title="🔥 Bán chạy nhất" 
                  />
                </div>
                <div className="bg-card">
                  <ShopFeaturedCarousel 
                    products={[...products].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())} 
                    title="✨ Mới nhất" 
                  />
                </div>
                
                {/* Featured Grid */}
                <div className="px-2">
                  <ShopFeaturedGrid 
                    products={[...products].sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))}
                    title="⭐ Sản phẩm nổi bật"
                  />
                </div>
              </>}
            
            {activeTab === "products" && <>
                {/* Filter Bar */}
                <div className="bg-card">
                  <ShopProductFilterBar sortBy={sortBy} onSortChange={setSortBy} />
                </div>
                
                {/* Products Grid */}
                <div className="bg-card">
                  <ShopProductGrid products={sortedProducts} viewMode="grid-2" />
                </div>
              </>}
            
            {activeTab === "profile" && <div className="bg-card">
                <ShopProfileTab seller={seller} />
              </div>}
          </div>
        </div>
      </main>

      <MobileBottomNav />
      <Footer />
    </div>;
};
export default ShopPage;