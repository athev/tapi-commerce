
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, MessageSquare, Filter } from "lucide-react";

const SellerReviews = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - in real app, fetch from Supabase
  const reviews = [
    {
      id: 1,
      productName: "Khóa học React cơ bản",
      customerName: "Nguyễn Văn A",
      rating: 5,
      comment: "Khóa học rất hay và dễ hiểu. Giảng viên giải thích chi tiết.",
      date: "2024-05-20",
      status: "published"
    },
    {
      id: 2,
      productName: "Template Landing Page",
      customerName: "Trần Thị B",
      rating: 4,
      comment: "Template đẹp, dễ sử dụng. Tuy nhiên cần thêm một số tính năng.",
      date: "2024-05-18",
      status: "pending"
    },
    {
      id: 3,
      productName: "Ebook Marketing Online",
      customerName: "Lê Văn C",
      rating: 3,
      comment: "Nội dung ổn nhưng hơi cũ, cần cập nhật thêm.",
      date: "2024-05-15",
      status: "published"
    }
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const getAverageRating = () => {
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const filteredReviews = reviews.filter(review => {
    const matchesFilter = filter === "all" || review.status === filter;
    const matchesSearch = review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const distribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Đánh giá & Nhận xét</h2>
        <p className="text-gray-600">Quản lý phản hồi của khách hàng về sản phẩm</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{getAverageRating()}</div>
            <div className="flex justify-center my-2">
              {renderStars(Math.round(parseFloat(getAverageRating())))}
            </div>
            <div className="text-sm text-gray-600">{reviews.length} đánh giá</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-3">Phân bố đánh giá</h3>
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center space-x-2 mb-1">
                <span className="text-sm w-3">{rating}</span>
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${(distribution[rating as keyof typeof distribution] / reviews.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm w-6">{distribution[rating as keyof typeof distribution]}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-3">Trạng thái</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Đã duyệt:</span>
                <span className="font-medium">{reviews.filter(r => r.status === 'published').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Chờ duyệt:</span>
                <span className="font-medium">{reviews.filter(r => r.status === 'pending').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm theo sản phẩm hoặc khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            Tất cả
          </Button>
          <Button
            variant={filter === "published" ? "default" : "outline"}
            onClick={() => setFilter("published")}
            size="sm"
          >
            Đã duyệt
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            size="sm"
          >
            Chờ duyệt
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium">{review.productName}</h3>
                  <p className="text-sm text-gray-600">bởi {review.customerName}</p>
                </div>
                <Badge variant={review.status === 'published' ? 'default' : 'secondary'}>
                  {review.status === 'published' ? 'Đã duyệt' : 'Chờ duyệt'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 mb-3">
                {renderStars(review.rating)}
                <span className="text-sm text-gray-600">
                  {new Date(review.date).toLocaleDateString('vi-VN')}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4">{review.comment}</p>
              
              <div className="flex space-x-2">
                {review.status === 'pending' && (
                  <>
                    <Button size="sm" variant="outline">Duyệt</Button>
                    <Button size="sm" variant="destructive">Từ chối</Button>
                  </>
                )}
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Trả lời
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SellerReviews;
