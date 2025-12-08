import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Star, ChevronRight, Shield, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { formatPrice } from "@/utils/priceUtils";
import { Link, useNavigate } from "react-router-dom";
import WarrantyClaimModal from "@/components/warranty/WarrantyClaimModal";
import { getWarrantyStatus, formatWarrantyExpiry } from "@/utils/warrantyUtils";
import { toast } from "sonner";
interface MobileOrderCardProps {
  order: any;
  hasReview: boolean;
  onViewDetails: () => void;
  onReview: () => void;
  onBuyAgain: () => void;
}

const MobileOrderCard = ({ 
  order, 
  hasReview,
  onViewDetails, 
  onReview, 
  onBuyAgain 
}: MobileOrderCardProps) => {
  const navigate = useNavigate();
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);

  const getStatusBadge = () => {
    if (order.status === 'pending') {
      return <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">Chờ thanh toán</Badge>;
    }
    if (order.status === 'cancelled') {
      return <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">Đã hủy</Badge>;
    }
    if (order.delivery_status === 'completed') {
      return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">Hoàn thành</Badge>;
    }
    if (order.delivery_status === 'delivered') {
      return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">Đã giao</Badge>;
    }
    if (order.delivery_status === 'processing') {
      return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">Đang xử lý</Badge>;
    }
    return <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">Chờ xử lý</Badge>;
  };

  const displayPrice = order.bank_amount || order.variant?.price || order.product?.price || 0;
  const originalPrice = order.discount_amount 
    ? displayPrice + order.discount_amount 
    : order.variant?.original_price || null;

  const canReview = order.status === 'paid' && 
                    order.delivery_status === 'completed' && 
                    !hasReview;

  // Calculate review deadline (7 days from delivery)
  const getReviewDeadline = () => {
    if (!order.payment_verified_at) return null;
    const deadline = new Date(order.payment_verified_at);
    deadline.setDate(deadline.getDate() + 7);
    return deadline.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <>
      <Card className="mb-3 overflow-hidden">
        {/* Shop Header */}
        <div 
          className="flex items-center justify-between p-3 border-b bg-accent/30 cursor-pointer"
          onClick={onViewDetails}
        >
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{order.product?.seller_name || 'Shop'}</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3" onClick={onViewDetails}>
          <div className="flex gap-3">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
              <img 
                src={order.product?.image || '/placeholder.svg'} 
                alt={order.product?.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2 mb-1">
                {order.product?.title}
              </h4>
              {order.variant && (
                <p className="text-xs text-muted-foreground mb-1">
                  Phân loại: {order.variant.variant_name}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {originalPrice && originalPrice > displayPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-primary">
                    {formatPrice(displayPrice)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">x1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Notes / Key Info - Only for completed orders */}
        {order.delivery_status === 'completed' && order.delivery_notes && (
          <div className="mx-3 mb-2 p-3 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
              Thông tin đơn hàng / Key
            </p>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-mono whitespace-pre-wrap flex-1 break-all">
                {order.delivery_notes}
              </p>
              <Button 
                variant="ghost" 
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(order.delivery_notes);
                  toast.success("Đã sao chép thông tin");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Warranty Status - Only for completed orders with warranty */}
        {order.delivery_status === 'completed' && order.product?.warranty_period && order.product.warranty_period !== 'none' && (() => {
          const warrantyStatus = getWarrantyStatus(order.payment_verified_at, order.product.warranty_period);
          const expiryDate = warrantyStatus.expiryDate;
          
          return (
            <div className={`mx-3 mb-2 p-3 rounded-lg border ${
              warrantyStatus.isActive 
                ? 'bg-green-50 border-green-200' 
                : 'bg-muted/50 border-muted-foreground/20'
            }`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {warrantyStatus.isActive ? (
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${warrantyStatus.isActive ? 'text-green-700' : 'text-muted-foreground'}`}>
                      {warrantyStatus.isActive 
                        ? warrantyStatus.remainingDays === -1 
                          ? 'Bảo hành trọn đời'
                          : `Còn hạn: ${warrantyStatus.remainingDays} ngày`
                        : 'Hết hạn bảo hành'
                      }
                    </p>
                    {expiryDate && warrantyStatus.remainingDays !== -1 && (
                      <p className={`text-xs ${warrantyStatus.isActive ? 'text-green-600' : 'text-muted-foreground'}`}>
                        Hết hạn: {formatWarrantyExpiry(expiryDate)}
                      </p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs shrink-0"
                  disabled={!warrantyStatus.isActive}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowWarrantyModal(true);
                  }}
                >
                  <Shield className="h-3.5 w-3.5 mr-1" />
                  Yêu cầu bảo hành
                </Button>
              </div>
            </div>
          );
        })()}

        {/* Total */}
        <div className="px-3 py-2 border-t bg-accent/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Tổng số tiền (1 sản phẩm):</span>
            <span className="font-semibold text-primary">{formatPrice(displayPrice)}</span>
          </div>
        </div>

        {/* Review Incentive Banner */}
        {canReview && (
          <div 
            className="px-3 py-2 bg-yellow-50 border-t border-yellow-100 flex items-center justify-between cursor-pointer"
            onClick={onReview}
          >
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-xs text-yellow-700">
                Đánh giá trước {getReviewDeadline()} để nhận 1 PI
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-yellow-500" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-3 border-t flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={onBuyAgain}
          >
            Mua lại
          </Button>
          {canReview && (
            <Button
              size="sm"
              className="text-xs bg-primary"
              onClick={onReview}
            >
              Đánh giá
            </Button>
          )}
          {order.status === 'pending' && (
            <Button
              size="sm"
              className="text-xs"
              asChild
            >
              <Link to={`/payment/${order.id}`}>Thanh toán</Link>
            </Button>
          )}
        </div>
      </Card>

      {/* Warranty Claim Modal */}
      {order.product && (
        <WarrantyClaimModal
          open={showWarrantyModal}
          onOpenChange={setShowWarrantyModal}
          order={order}
          product={order.product}
          onSuccess={(conversationId) => {
            navigate(`/chat/${conversationId}`);
          }}
        />
      )}
    </>
  );
};

export default MobileOrderCard;
