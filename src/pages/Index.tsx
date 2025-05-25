import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/home/HeroBanner";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import ProductGrid from "@/components/products/ProductGrid";
import { ProductCardProps } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { mockCategories, mockProducts } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Get search param from URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || "";
  const categoryParam = searchParams.get('category') || "all";
  
  // Set search term from URL on mount
  useEffect(() => {
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [searchQuery, categoryParam]);
  
  // Fetch categories with better error handling
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        console.log('Fetching categories...');
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (error) {
          console.warn('Categories fetch error:', error);
          throw error;
        }
        console.log('Categories fetched successfully:', data);
        return data;
      } catch (error) {
        console.warn('Using mock categories due to error:', error);
        return mockCategories;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch products with better error handling
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', activeCategory, searchTerm],
    queryFn: async () => {
      try {
        console.log('Fetching products with filters:', { activeCategory, searchTerm });
        
        let query = supabase.from('products').select('*');
        
        // Apply category filter
        if (activeCategory !== "all") {
          query = query.eq('category', activeCategory);
        }
        
        // Apply search filter
        if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
        }
        
        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(50); // Add limit to avoid large payloads
        
        if (error) {
          console.warn('Products fetch error:', error);
          throw error;
        }
        
        console.log('Products fetched successfully:', data?.length, 'items');
        
        return data.map(item => ({
          id: item.id,
          title: item.title,
          price: { min: item.price, max: item.price },
          image: item.image || '/placeholder.svg',
          category: item.category,
          rating: 4.5,
          reviews: item.purchases || 0,
          seller: {
            name: item.seller_name,
            verified: true,
          },
          inStock: item.in_stock,
          isNew: new Date(item.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        }));
      } catch (error) {
        console.warn('Using mock products due to error:', error);
        
        // Filter mock data based on category and search term
        let filteredProducts = [...mockProducts];
        
        if (activeCategory !== "all") {
          filteredProducts = filteredProducts.filter(p => p.category === activeCategory);
        }
        
        if (searchTerm) {
          filteredProducts = filteredProducts.filter(p => 
            p.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        return filteredProducts.map(item => ({
          id: item.id,
          title: item.title,
          price: { min: item.price, max: item.price },
          image: item.image || '/placeholder.svg',
          category: item.category,
          rating: 4.5,
          reviews: item.purchases || 0,
          seller: {
            name: item.seller_name,
            verified: true,
          },
          inStock: item.in_stock,
          isNew: new Date(item.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        }));
      }
    },
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  // Fetch new products with better error handling
  const { data: newProducts } = useQuery({
    queryKey: ['newProducts'],
    queryFn: async () => {
      try {
        console.log('Fetching new products...');
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) {
          console.warn('New products fetch error:', error);
          throw error;
        }
        
        return data.map(item => ({
          id: item.id,
          title: item.title,
          price: { min: item.price, max: item.price },
          image: item.image || '/placeholder.svg',
          category: item.category,
          rating: 4.5,
          reviews: item.purchases || 0,
          seller: {
            name: item.seller_name,
            verified: true,
          },
          inStock: item.in_stock,
          isNew: true,
        }));
      } catch (error) {
        console.warn('Using mock new products due to error:', error);
        
        return mockProducts.slice(0, 5).map(item => ({
          id: item.id,
          title: item.title,
          price: { min: item.price, max: item.price },
          image: item.image || '/placeholder.svg',
          category: item.category,
          rating: 4.5,
          reviews: item.purchases || 0,
          seller: {
            name: item.seller_name,
            verified: true,
          },
          inStock: item.in_stock,
          isNew: true,
        }));
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Handler for category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    navigate(category === "all" 
      ? searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '/' 
      : `?category=${encodeURIComponent(category)}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`);
  };
  
  // Handler for search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(activeCategory === "all" 
      ? `?search=${encodeURIComponent(searchTerm)}` 
      : `?category=${encodeURIComponent(activeCategory)}&search=${encodeURIComponent(searchTerm)}`);
  };

  useEffect(() => {
    document.title = "DigitalMarket - Sàn thương mại điện tử sản phẩm số phục vụ kiếm tiền online";
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Only show banner on homepage with no filters */}
        {!searchTerm && activeCategory === "all" && (
          <HeroBanner />
        )}
        
        {/* Only show categories on homepage with no filters */}
        {!searchTerm && activeCategory === "all" && (
          <FeaturedCategories />
        )}
        
        {/* Products section with filters */}
        <section className={`container py-12 ${searchTerm || activeCategory !== "all" ? "pt-6" : ""}`}>
          {/* Search and filter UI when searching or filtering */}
          {(searchTerm || activeCategory !== "all") && (
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-4">
                {searchTerm ? `Kết quả tìm kiếm: ${searchTerm}` : `Danh mục: ${activeCategory}`}
              </h1>
              
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                {/* Search form */}
                <form onSubmit={handleSearch} className="flex w-full md:max-w-sm items-center space-x-2">
                  <Input 
                    type="search" 
                    placeholder="Tìm kiếm sản phẩm..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" size="icon" variant="outline">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Tìm kiếm</span>
                  </Button>
                </form>
                
                {/* Category tabs */}
                <div className="overflow-x-auto w-full">
                  <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="w-full">
                    <TabsList className="w-max">
                      <TabsTrigger value="all">Tất cả</TabsTrigger>
                      {categories?.map(category => (
                        <TabsTrigger key={category.id} value={category.name}>
                          {category.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
          
          {/* Products grid with error handling */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2 text-red-600">Có lỗi xảy ra khi tải sản phẩm</h2>
              <p className="text-gray-500 mb-4">Đang sử dụng dữ liệu mẫu. Vui lòng thử lại sau.</p>
              <Button onClick={() => window.location.reload()}>
                Tải lại trang
              </Button>
            </div>
          ) : products && products.length > 0 ? (
            <ProductGrid 
              title={searchTerm || activeCategory !== "all" ? "" : "Sản phẩm nổi bật"} 
              products={products as ProductCardProps[]} 
              showFilters={!searchTerm && activeCategory === "all"}
            />
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h2>
              <p className="text-gray-500 mb-4">Không tìm thấy sản phẩm phù hợp với tiêu chí tìm kiếm của bạn.</p>
              <Button onClick={() => {
                setSearchTerm("");
                setActiveCategory("all");
                navigate('/');
              }}>
                Xem tất cả sản phẩm
              </Button>
            </div>
          )}
        </section>
        
        {/* New products section */}
        {!searchTerm && activeCategory === "all" && newProducts && newProducts.length > 0 && (
          <section className="bg-gray-50 py-12">
            <div className="container">
              <ProductGrid 
                title="Sản phẩm mới" 
                products={newProducts as ProductCardProps[]}
              />
            </div>
          </section>
        )}
        
        {/* Call to action */}
        {!searchTerm && activeCategory === "all" && (
          <section className="container py-12">
            <div className="bg-marketplace-primary/10 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Bạn muốn bán sản phẩm số của mình?</h2>
              <p className="text-lg mb-6 max-w-2xl mx-auto">
                Tham gia cộng đồng người bán của chúng tôi và tiếp cận hàng nghìn khách hàng tiềm năng.
              </p>
              <Button size="lg" className="bg-marketplace-primary hover:bg-marketplace-primary/90">
                Đăng ký bán hàng ngay
              </Button>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
