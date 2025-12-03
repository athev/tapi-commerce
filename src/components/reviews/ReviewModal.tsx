import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Upload, X, Gift, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: {
    id: string;
    product_id: string;
    product_title?: string;
    product_image?: string;
    variant_name?: string;
  };
  onSuccess: () => void;
}

const ReviewModal = ({ open, onOpenChange, order, onSuccess }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const ratingLabels = ["", "Tệ", "Không hài lòng", "Bình thường", "Hài lòng", "Tuyệt vời"];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || images.length >= 5) return;

    setUploading(true);
    const newImages: string[] = [];

    for (let i = 0; i < Math.min(files.length, 5 - images.length); i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `reviews/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        newImages.push(publicUrl);
      }
    }

    setImages(prev => [...prev, ...newImages]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Vui lòng chọn số sao",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-review', {
        body: {
          order_id: order.id,
          product_id: order.product_id,
          rating,
          comment: comment.trim() || null,
          images,
          variant_name: order.variant_name || null
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Đánh giá thành công! 🎉",
          description: data.pi_rewarded 
            ? `Bạn đã nhận được ${data.pi_amount} PI. Số dư: ${data.new_balance} PI`
            : "Cảm ơn bạn đã đánh giá sản phẩm!"
        });
        onSuccess();
        onOpenChange(false);
        // Reset form
        setRating(0);
        setComment("");
        setImages([]);
      } else {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      console.error('Submit review error:', error);
      toast({
        title: "Không thể gửi đánh giá",
        description: error.message || "Vui lòng thử lại sau",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Đánh Giá Sản Phẩm</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
            {order.product_image && (
              <img
                src={order.product_image}
                alt={order.product_title}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h4 className="font-medium line-clamp-2">{order.product_title}</h4>
              {order.variant_name && (
                <p className="text-sm text-muted-foreground">
                  Phân loại: {order.variant_name}
                </p>
              )}
            </div>
          </div>

          {/* Star Rating */}
          <div className="text-center">
            <Label className="text-sm text-muted-foreground mb-3 block">
              Chất lượng sản phẩm
            </Label>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= displayRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {displayRating > 0 && (
              <p className="text-sm font-medium text-primary">
                {ratingLabels[displayRating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="text-sm">
              Viết đánh giá của bạn (không bắt buộc)
            </Label>
            <Textarea
              id="comment"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="mt-2"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {comment.length}/1000
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-sm">Thêm hình ảnh (tối đa 5)</Label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img}
                    alt={`Upload ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  )}
                </label>
              )}
            </div>
          </div>

          {/* PI Reward Banner */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 rounded-full p-2">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-primary">
                  Đánh giá 5⭐ để nhận 1 PI!
                </p>
                <p className="text-sm text-muted-foreground">
                  Tích lũy PI để đổi voucher giảm giá
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            size="lg"
            disabled={submitting || rating === 0}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang gửi...
              </>
            ) : (
              'Gửi Đánh Giá'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
