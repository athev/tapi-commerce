
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ThumbsUp } from "lucide-react";
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
      content: "Sản phẩm rất tốt, đúng như mô tả. Tôi đã sử dụng và rất hài lòng với kết quả.",
      helpful: 12,
      verified: true
    },
    {
      id: "2", 
      author: "Trần Thị B",
      rating: 4,
      date: "2024-01-10",
      content: "Chất lượng ổn, giao hàng nhanh. Tuy nhiên có một số điểm nhỏ cần cải thiện.",
      helpful: 8,
      verified: true
    },
    {
      id: "3",
      author: "Lê Văn C",
      rating: 5,
      date: "2024-01-05",
      content: "Excellent product! Exactly what I needed for my project.",
      helpful: 15,
      verified: false
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Đánh giá sản phẩm</span>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 font-semibold">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-gray-500">({totalReviews} đánh giá)</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center space-x-2">
                <span className="text-sm w-2">{stars}</span>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${(stars / 5) * 80}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-8">{Math.floor((stars / 5) * 80)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Individual Reviews */}
        <div className="space-y-4">
          {mockReviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{review.author}</span>
                    {review.verified && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Đã mua hàng
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
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
              
              <p className="text-gray-700 mb-2">{review.content}</p>
              
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                <ThumbsUp className="h-4 w-4 mr-1" />
                Hữu ích ({review.helpful})
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full">
          Xem tất cả đánh giá
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductReviews;
