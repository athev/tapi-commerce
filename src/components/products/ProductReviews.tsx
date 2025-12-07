import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp, Image as ImageIcon, MessageSquare, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  images: string[];
  variant_name: string | null;
  seller_response: string | null;
  seller_response_at: string | null;
  helpful_count: number;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    avatar: string | null;
  };
}

interface ProductReviewsProps {
  productId: string;
  avgRating?: number;
  totalReviews?: number;
}

// Ẩn danh hóa tên người dùng theo style Shopee với số ngẫu nhiên dựa trên review ID
const anonymizeName = (name: string | undefined, reviewId: string): string => {
  if (!name || name.length < 2) return "Người dùng";
  
  // Tạo số ngẫu nhiên nhất quán từ review ID
  const hash = reviewId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const randomSuffix = (hash % 900) + 100; // Số từ 100-999
  
  const firstChar = name.charAt(0).toUpperCase();
  const lastChar = name.charAt(name.length - 1).toLowerCase();
  return `${firstChar}*****${lastChar}${randomSuffix}`;
};

const ProductReviews = ({ productId, avgRating = 5.0, totalReviews = 0 }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<number | 'all' | 'comment' | 'image'>('all');
  const [ratingCounts, setRatingCounts] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<{ src: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [productId, selectedFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Fetch all reviews for counts
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating, comment, images')
        .eq('product_id', productId);

      if (allReviews) {
        const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        allReviews.forEach(r => {
          counts[r.rating] = (counts[r.rating] || 0) + 1;
        });
        setRatingCounts(counts);
      }

      // Build query for filtered reviews - fetch reviews then profiles separately
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (typeof selectedFilter === 'number') {
        query = query.eq('rating', selectedFilter);
      } else if (selectedFilter === 'comment') {
        query = query.not('comment', 'is', null).neq('comment', '');
      } else if (selectedFilter === 'image') {
        query = query.not('images', 'eq', '{}');
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch profiles for reviewers
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar')
          .in('id', userIds);
        
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        const reviewsWithProfiles = data.map(review => ({
          ...review,
          profiles: profileMap.get(review.user_id) || { full_name: 'Người dùng', avatar: null }
        }));
        setReviews(reviewsWithProfiles);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    const { error } = await supabase
      .from('reviews')
      .update({ helpful_count: reviews.find(r => r.id === reviewId)!.helpful_count + 1 })
      .eq('id', reviewId);

    if (!error) {
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
      ));
    }
  };

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images.map(src => ({ src })));
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${sizeClass} ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const countWithImages = reviews.filter(r => r.images && r.images.length > 0).length;
  const countWithComments = reviews.filter(r => r.comment && r.comment.trim()).length;

  const filterButtons = [
    { key: 'all' as const, label: 'Tất Cả' },
    { key: 5, label: `5 Sao (${ratingCounts[5]})` },
    { key: 4, label: `4 Sao (${ratingCounts[4]})` },
    { key: 3, label: `3 Sao (${ratingCounts[3]})` },
    { key: 2, label: `2 Sao (${ratingCounts[2]})` },
    { key: 1, label: `1 Sao (${ratingCounts[1]})` },
    { key: 'comment' as const, label: `Có Bình Luận (${countWithComments})` },
    { key: 'image' as const, label: `Có Hình Ảnh (${countWithImages})` },
  ];

  return (
    <div className="space-y-6">
      {/* Rating Summary Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">ĐÁNH GIÁ SẢN PHẨM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Average Rating */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {avgRating.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">trên 5</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex">{renderStars(Math.round(avgRating), 'lg')}</div>
                <div className="text-sm text-muted-foreground">
                  {totalReviews} đánh giá
                </div>
              </div>
            </div>

            {/* Right: Filter Buttons */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                {filterButtons.map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={selectedFilter === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(key)}
                    className="text-xs"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {selectedFilter === 'all' 
                  ? 'Chưa có đánh giá nào cho sản phẩm này'
                  : 'Không có đánh giá phù hợp với bộ lọc'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={review.profiles?.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {review.profiles?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      {/* User Info */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {anonymizeName(review.profiles?.full_name, review.id)}
                        </span>
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          Đã mua hàng
                        </Badge>
                      </div>

                      {/* Rating & Date */}
                      <div className="flex items-center gap-2 mb-2 text-sm">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString('vi-VN')}
                        </span>
                        {review.variant_name && (
                          <>
                            <span className="text-muted-foreground">|</span>
                            <span className="text-muted-foreground">
                              Phân loại: {review.variant_name}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Comment */}
                      {review.comment && (
                        <p className="text-foreground mb-3">{review.comment}</p>
                      )}

                      {/* Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mb-3 flex-wrap">
                          {review.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Review image ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border"
                              onClick={() => openLightbox(review.images, idx)}
                            />
                          ))}
                        </div>
                      )}

                      {/* Seller Response */}
                      {review.seller_response && (
                        <div className="bg-muted/50 rounded-lg p-3 mt-3 border-l-4 border-primary">
                          <div className="text-sm font-medium text-primary mb-1">
                            Phản Hồi Của Người Bán
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {review.seller_response}
                          </p>
                        </div>
                      )}

                      {/* Helpful Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-muted-foreground hover:text-primary"
                        onClick={() => handleHelpful(review.id)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {review.helpful_count > 0 && review.helpful_count}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxImages}
        index={lightboxIndex}
      />
    </div>
  );
};

export default ProductReviews;
