import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const ShopPage = () => {
  const { slug, id, sellerId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState<ShopTab>("home");

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
      </Helmet>
      
      <EnhancedNavbar />
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Shop Header */}
        <ShopHeader seller={seller} />
        
        {/* Stats Bar */}
        <ShopStatsBar 
          productsCount={products.length}
          rating={seller.seller_rating}
          responseRate={seller.response_rate}
        />
        
        {/* Tabs Navigation */}
        <ShopTabsNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {/* Tab Content */}
        {activeTab === "home" && (
          <>
            <ShopVouchersSection sellerId={seller.id} />
            <ShopFeaturedCarousel products={products} title="Bán chạy nhất" />
            <ShopFeaturedCarousel 
              products={[...products].sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )} 
              title="Mới nhất" 
            />
          </>
        )}
        
        {activeTab === "products" && (
          <ShopProductGrid 
            products={products}
            viewMode="grid-2"
          />
        )}
        
        {activeTab === "profile" && (
          <ShopProfileTab seller={seller} />
        )}
      </main>

      <MobileBottomNav />
      <Footer />
    </div>
  );
};

export default ShopPage;
