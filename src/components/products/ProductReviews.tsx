import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import RatingBreakdown from "./RatingBreakdown";

interface ProductReviewsProps {
  // Make props optional to handle any product structure
  [key: string]: any;
}

const ProductReviews = (props: ProductReviewsProps) => {
  // Mock reviews data - in real app this would come from Supabase
  const reviews = [
    {
      id: 1,
      userName: "Nguyễn Văn A",
      rating: 5,
      comment: "Sản phẩm rất tốt, đúng như mô tả. Tôi rất hài lòng.",
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      userName: "Trần Thị B",
      rating: 4,
      comment: "Chất lượng ổn, giao hàng nhanh. Sẽ mua lại lần sau.",
      createdAt: "2024-01-10"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="grid md:grid-cols-[300px,1fr] gap-6">
      {/* Left: Rating summary */}
      <RatingBreakdown 
        avgRating={4.8}
        totalReviews={124}
        ratingDistribution={{ 5: 80, 4: 30, 3: 10, 2: 3, 1: 1 }}
      />

      {/* Right: Review list */}
      <Card>
        <CardHeader>
          <CardTitle>Đánh giá từ khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Chưa có đánh giá nào cho sản phẩm này
            </p>
          ) : (
            <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      {review.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{review.userName}</h4>
                      <Badge variant="outline" className="text-xs">
                        Đã mua hàng
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-1 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600 ml-2">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

export default ProductReviews;
