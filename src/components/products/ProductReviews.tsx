
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ThumbsUp, MessageSquare, User, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  content: string;
  helpful: number;
  verified: boolean;
  images?: string[];
  sellerResponse?: {
    content: string;
    date: string;
  };
}

interface ProductReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

const ProductReviews = ({ reviews, averageRating, totalReviews }: ProductReviewsProps) => {
  const mockReviews: Review[] = [
    {
      id: "1",
      author: "Nguyễn Văn A",
      rating: 5,
      date: "2024-01-15",
      content: "Sản phẩm rất tốt, đúng như mô tả. File Excel template rất chi tiết và dễ sử dụng. Tôi đã áp dụng ngay vào công việc và tiết kiệm được rất nhiều thời gian.",
      helpful: 24,
      verified: true,
      images: ["/placeholder.svg"],
      sellerResponse: {
        content: "Cảm ơn bạn đã ủng hộ! Chúng tôi rất vui khi sản phẩm giúp ích được cho công việc của bạn. Nếu cần hỗ trợ thêm, đừng ngại liên hệ nhé!",
        date: "2024-01-16"
      }
    },
    {
      id: "2", 
      author: "Trần Thị B",
      rating: 4,
      date: "2024-01-10",
      content: "Chất lượng template tốt, giao hàng nhanh. Có một số công thức phức tạp nhưng nhìn chung rất hữu ích cho việc quản lý tài chính cá nhân.",
      helpful: 18,
      verified: true,
      images: ["/placeholder.svg", "/placeholder.svg"]
    },
    {
      id: "3",
      author: "Lê Văn C",
      rating: 5,
      date: "2024-01-05",
      content: "Outstanding Excel template! Very professional design and extremely useful formulas. Worth every penny!",
      helpful: 31,
      verified: true,
      sellerResponse: {
        content: "Thank you so much for your kind words! We're thrilled that you found our Excel template helpful. Your feedback motivates us to create even better products!",
        date: "2024-01-06"
      }
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getRatingDistribution = () => {
    return [
      { stars: 5, percentage: 75, count: 117 },
      { stars: 4, percentage: 15, count: 23 },
      { stars: 3, percentage: 6, count: 9 },
      { stars: 2, percentage: 3, count: 5 },
      { stars: 1, percentage: 1, count: 2 }
    ];
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gray-50">
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl">Đánh giá từ khách hàng</span>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">{totalReviews} đánh giá</div>
              <div className="text-xs text-green-600">96% hài lòng</div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        {/* Rating Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Phân bố đánh giá</h4>
            {getRatingDistribution().map(({ stars, percentage, count }) => (
              <div key={stars} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-12">
                  <span className="text-sm font-medium">{stars}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-yellow-400 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Khách hàng nói gì?</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Chất lượng sản phẩm</span>
                <span className="font-semibold text-blue-900">4.9/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Đúng mô tả</span>
                <span className="font-semibold text-blue-900">4.8/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Giao hàng nhanh</span>
                <span className="font-semibold text-blue-900">5.0/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Reviews */}
        <div className="space-y-6">
          <h4 className="font-semibold text-gray-900 text-lg">Đánh giá chi tiết</h4>
          {mockReviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900">{review.author}</span>
                      {review.verified && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          <span className="mr-1">✓</span>
                          Đã mua hàng
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {Array(5).fill(0).map((_, i) => (
                          <Star 
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Review Content */}
              <p className="text-gray-700 mb-3 leading-relaxed">{review.content}</p>
              
              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex space-x-2 mb-3">
                  {review.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`Review image ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute top-1 right-1 bg-black/50 rounded-full p-1">
                        <Camera className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Helpful Button */}
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Hữu ích ({review.helpful})
                </Button>
                
                <span className="text-sm text-gray-400">
                  {review.sellerResponse ? "Đã phản hồi" : ""}
                </span>
              </div>
              
              {/* Seller Response */}
              {review.sellerResponse && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-blue-900 text-sm">Phản hồi từ shop</span>
                        <span className="text-xs text-blue-600">{formatDate(review.sellerResponse.date)}</span>
                      </div>
                      <p className="text-blue-800 text-sm">{review.sellerResponse.content}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center">
          <Button variant="outline" size="lg" className="px-8">
            Xem tất cả {totalReviews} đánh giá
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductReviews;
