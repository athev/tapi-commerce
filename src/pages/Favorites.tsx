import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import EnhancedNavbar from '@/components/layout/EnhancedNavbar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import Footer from '@/components/layout/Footer';
import EnhancedProductCard from '@/components/products/EnhancedProductCard';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          product_id,
          products (
            id,
            title,
            price,
            image,
            category,
            average_rating,
            review_count,
            seller_name,
            in_stock,
            slug
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      const productsData = data?.map(f => f.products).filter(Boolean) || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <EnhancedNavbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Đăng nhập để xem sản phẩm yêu thích</h2>
            <p className="text-muted-foreground mb-6">
              Lưu sản phẩm yêu thích để dễ dàng mua sắm sau
            </p>
            <Button asChild>
              <Link to="/login">Đăng nhập ngay</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-16 lg:pb-0">
      <EnhancedNavbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            <div>
              <h1 className="text-3xl font-bold">Sản phẩm yêu thích</h1>
              <p className="text-muted-foreground">
                {products.length} sản phẩm
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Chưa có sản phẩm yêu thích</h3>
              <p className="text-muted-foreground mb-6">
                Khám phá và lưu những sản phẩm bạn thích
              </p>
              <Button asChild>
                <Link to="/">Khám phá ngay</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {products.map((product) => (
                <EnhancedProductCard
                  key={product.id}
                  id={product.slug || product.id}
                  title={product.title}
                  price={{ min: product.price, max: product.price }}
                  image={product.image}
                  category={product.category}
                  rating={product.average_rating}
                  reviews={product.review_count}
                  seller={{ name: product.seller_name, verified: false }}
                  inStock={product.in_stock}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Favorites;
