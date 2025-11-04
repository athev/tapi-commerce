import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface RatingBreakdownProps {
  avgRating?: number;
  totalReviews?: number;
  ratingDistribution?: { [key: number]: number };
}

const RatingBreakdown = ({ 
  avgRating = 4.8, 
  totalReviews = 124,
  ratingDistribution = { 5: 80, 4: 30, 3: 10, 2: 3, 1: 1 }
}: RatingBreakdownProps) => {
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingPercent = (star: number) => {
    const count = ratingDistribution[star] || 0;
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="text-5xl font-bold text-gray-900 mb-2">
          {avgRating.toFixed(1)}
        </div>
        <div className="flex justify-center mb-2">
          {renderStars(Math.round(avgRating))}
        </div>
        <div className="text-sm text-muted-foreground mb-6">
          {totalReviews.toLocaleString()} đánh giá
        </div>
        
        {/* Rating breakdown */}
        <div className="space-y-2 text-left">
          {[5, 4, 3, 2, 1].map(star => {
            const count = ratingDistribution[star] || 0;
            const percent = getRatingPercent(star);
            
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs w-6 flex items-center gap-0.5 font-medium">
                  {star}<Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                </span>
                <Progress value={percent} className="flex-1 h-2" />
                <span className="text-xs w-8 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RatingBreakdown;
