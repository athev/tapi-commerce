
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  ShoppingCart, 
  Heart,
  Star, 
  Check, 
  ShieldCheck, 
  Clock,
  Info
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductGrid from "@/components/products/ProductGrid";
import { ProductCardProps } from "@/components/products/ProductCard";

// Mock data for similar products
const similarProducts: ProductCardProps[] = [
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
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(price);
};

const ProductDetail = () => {
  const { id } = useParams();
  
  // For this demonstration, we'll use mock data for product ID 1
  const product = {
    id: "1",
    title: "Khóa học Facebook Marketing toàn tập",
    description: "Khóa học Facebook Marketing toàn tập giúp bạn nắm vững các chiến lược marketing hiệu quả trên nền tảng Facebook. Từ cơ bản đến nâng cao, khóa học cung cấp các kỹ thuật tối ưu quảng cáo, tăng tương tác và chuyển đổi.",
    price: 799000,
    originalPrice: 999000,
    images: ["/public/lovable-uploads/bc39c71c-0a95-45a8-8b9c-550af21ab54a.png"],
    category: "Khóa học",
    rating: 4,
    reviews: 156,
    seller: {
      name: "DigitalEdu",
      verified: true,
      joinedDate: "05/2020",
      rating: 4.8,
      totalSales: 1240,
    },
    inStock: 999,
    isHot: true,
    features: [
      "Hơn 50 giờ video HD",
      "Tài liệu PDF đầy đủ",
      "Bài tập thực hành",
      "Chứng chỉ hoàn thành",
      "Cập nhật nội dung thường xuyên",
      "Hỗ trợ kỹ thuật 24/7",
    ],
    warranty: "30 ngày hoàn tiền nếu không hài lòng",
    delivery: "Truy cập ngay sau khi thanh toán",
  };

  useEffect(() => {
    document.title = product.title + " | DigitalMarket";
  }, [product.title]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <div className="container py-8">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-6">
            Trang chủ &gt; {product.category} &gt; {product.title}
          </div>
          
          {/* Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Product Image */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={product.images[0]} 
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            {/* Product Details */}
            <div className="space-y-6">
              {product.isHot && (
                <Badge className="bg-red-500 text-white">HOT</Badge>
              )}
              
              <h1 className="text-3xl font-bold">{product.title}</h1>
              
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array(5).fill(0).map((_, i) => (
                    <Star 
                      key={i}
                      className={`h-5 w-5 ${i < product.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-gray-500">({product.reviews} đánh giá)</span>
              </div>
              
              <div className="flex items-end gap-4">
                <div className="text-3xl font-bold text-marketplace-primary">
                  {formatPrice(product.price)}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-lg text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </div>
                )}
                {product.originalPrice && product.originalPrice > product.price && (
                  <Badge className="bg-blue-500 text-white">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-gray-500">
                <Info className="h-4 w-4" />
                <span>Còn lại: {product.inStock}</span>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Người bán:</h3>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{product.seller.name}</span>
                  {product.seller.verified && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                      <Check className="h-3 w-3 mr-1" /> Đã xác thực
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Thành viên từ: {product.seller.joinedDate} | Đánh giá: {product.seller.rating}/5 | Đã bán: {product.seller.totalSales}
                </div>
              </div>
              
              <div className="pt-6 space-y-4">
                <Button className="w-full bg-marketplace-primary hover:bg-marketplace-primary/90">
                  <ShoppingCart className="h-5 w-5 mr-2" /> Mua ngay
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Heart className="h-5 w-5 mr-2" /> Thêm vào yêu thích
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-marketplace-primary" />
                  <div>
                    <div className="font-medium">Bảo hành</div>
                    <div className="text-sm text-gray-500">{product.warranty}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-marketplace-primary" />
                  <div>
                    <div className="font-medium">Giao hàng</div>
                    <div className="text-sm text-gray-500">{product.delivery}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs for description, features, reviews */}
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b rounded-none p-0 h-12">
              <TabsTrigger 
                value="description"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-marketplace-primary data-[state=active]:shadow-none h-12"
              >
                Mô tả
              </TabsTrigger>
              <TabsTrigger 
                value="features"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-marketplace-primary data-[state=active]:shadow-none h-12"
              >
                Tính năng
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-marketplace-primary data-[state=active]:shadow-none h-12"
              >
                Đánh giá ({product.reviews})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <p>{product.description}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Tính năng nổi bật</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Đánh giá từ người mua</h3>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="text-3xl font-bold">{product.rating}/5</div>
                      <div className="flex">
                        {Array(5).fill(0).map((_, i) => (
                          <Star 
                            key={i}
                            className={`h-5 w-5 ${i < product.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{product.reviews} đánh giá</div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="flex items-center gap-2">
                            <div className="w-8 text-sm text-gray-500">{star} sao</div>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-yellow-400" 
                                style={{ 
                                  width: `${star === product.rating ? "60%" : star > product.rating ? "10%" : "30%"}` 
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline">Xem tất cả đánh giá</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Similar Products */}
          <section className="mt-16">
            <ProductGrid 
              title="Sản phẩm tương tự" 
              products={similarProducts}
            />
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
