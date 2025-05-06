import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/home/HeroBanner";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import ProductGrid from "@/components/products/ProductGrid";
import { ProductCardProps } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";

// Mock data
const featuredProducts: ProductCardProps[] = [
  {
    id: "1",
    title: "Khóa học Facebook Marketing toàn tập",
    price: { min: 799000, max: 799000 },
    image: "/public/lovable-uploads/bc39c71c-0a95-45a8-8b9c-550af21ab54a.png",
    category: "Khóa học",
    rating: 4,
    reviews: 156,
    seller: {
      name: "DigitalEdu",
      verified: true,
    },
    inStock: 999,
    isHot: true,
  },
  {
    id: "2",
    title: "Facebook Cổ 1000-5000 Bạn Bè Có 40-300 Bài Viết",
    price: { min: 59000, max: 220000 },
    image: "/public/lovable-uploads/bc8aab58-b21e-4035-8b5f-7f07c45791db.png",
    category: "Tài khoản",
    rating: 4.5,
    reviews: 326,
    seller: {
      name: "shopbanreutin",
      verified: true,
    },
    inStock: 806,
  },
  {
    id: "3",
    title: "Plugin WordPress Premium bản quyền",
    price: { min: 199000, max: 199000 },
    image: "/placeholder.svg",
    category: "Phần mềm",
    rating: 5,
    reviews: 42,
    seller: {
      name: "shankin",
      verified: true,
    },
    inStock: 123,
    isNew: true,
  },
  {
    id: "4",
    title: "Proxy IPv4 Random Các Nước - ALL GEO",
    price: { min: 2000, max: 1000000 },
    image: "/placeholder.svg",
    category: "Dịch vụ",
    rating: 4.5,
    reviews: 54,
    seller: {
      name: "bradley_vbxtzb",
      verified: true,
    },
    inStock: 5113,
    discount: 20,
  },
  {
    id: "5",
    title: "Clone FB giá rẻ nhất thị trường",
    price: { min: 1400, max: 2500 },
    image: "/placeholder.svg",
    category: "Tài khoản",
    rating: 4,
    reviews: 78,
    seller: {
      name: "jeremy_enyllg",
      verified: true,
    },
    inStock: 123,
  },
];

const newProducts: ProductCardProps[] = [
  {
    id: "6",
    title: "YouTube Premium bản quyền",
    price: { min: 89000, max: 89000 },
    image: "/placeholder.svg",
    category: "Dịch vụ",
    rating: 5,
    reviews: 27,
    seller: {
      name: "premiumhub",
      verified: true,
    },
    inStock: 999,
    isNew: true,
  },
  {
    id: "7",
    title: "Khóa học SEO Master",
    price: { min: 1200000, max: 1200000 },
    image: "/placeholder.svg",
    category: "Khóa học",
    rating: 4.5,
    reviews: 18,
    seller: {
      name: "seomaster",
      verified: true,
    },
    inStock: 50,
    isNew: true,
  },
  {
    id: "8",
    title: "Tài khoản Netflix Premium",
    price: { min: 69000, max: 159000 },
    image: "/placeholder.svg",
    category: "Tài khoản",
    rating: 4,
    reviews: 89,
    seller: {
      name: "streamingworld",
      verified: true,
    },
    inStock: 245,
    isNew: true,
  },
  {
    id: "9",
    title: "Canva Pro 1 năm",
    price: { min: 150000, max: 150000 },
    image: "/placeholder.svg",
    category: "Phần mềm",
    rating: 5,
    reviews: 32,
    seller: {
      name: "designtools",
      verified: true,
    },
    inStock: 112,
    isNew: true,
  },
  {
    id: "10",
    title: "Adobe Creative Cloud 1 năm bản quyền",
    price: { min: 499000, max: 499000 },
    image: "/placeholder.svg",
    category: "Phần mềm",
    rating: 5,
    reviews: 15,
    seller: {
      name: "softwarehub",
      verified: true,
    },
    inStock: 42,
    isNew: true,
    discount: 15,
  },
];

const Index = () => {
  useEffect(() => {
    document.title = "DigitalMarket - Sàn thương mại điện tử sản phẩm số phục vụ kiếm tiền online";
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <HeroBanner />
        
        <FeaturedCategories />
        
        <section className="container py-12">
          <ProductGrid 
            title="Sản phẩm nổi bật" 
            products={featuredProducts} 
            showFilters={true}
          />
        </section>
        
        <section className="bg-gray-50 py-12">
          <div className="container">
            <ProductGrid 
              title="Sản phẩm mới" 
              products={newProducts}
            />
          </div>
        </section>
        
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
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
