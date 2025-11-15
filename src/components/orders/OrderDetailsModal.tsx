import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDate, getProductTypeLabel } from "@/utils/orderUtils";
import { getOrderStatusBadge, getDeliveryStatusBadge } from "@/components/seller/OrderStatusBadges";
import OrderTimeline from "./OrderTimeline";
import UpdateDeliveryStatusButton from "@/components/seller/UpdateDeliveryStatusButton";
import OrderConfirmButton from "@/components/buyer/OrderConfirmButton";
import OrderDisputeButton from "@/components/buyer/OrderDisputeButton";
import OrderInlineChat from "@/components/chat/OrderInlineChat";
import { useAuth } from "@/context/AuthContext";
import { Package, User, CreditCard, FileText, Calendar, Mail, MessageCircle } from "lucide-react";

interface OrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

const OrderDetailsModal = ({ open, onOpenChange, order }: OrderDetailsModalProps) => {
  const { user, profile } = useAuth();
  const isSeller = profile?.role === 'seller';
  // Handle both products (seller orders) and product (buyer orders)
  const product = order.products || order.product;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Chi tiết đơn hàng #{order.id.slice(0, 8)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4" />
              <span>Thông tin sản phẩm</span>
            </div>
            <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
              {product.image && (
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{product.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {getProductTypeLabel(product.product_type)}
                </p>
                <p className="text-lg font-bold text-primary mt-1">
                  {formatPrice(product.price)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Trạng thái thanh toán</p>
              {getOrderStatusBadge(order.status)}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Trạng thái giao hàng</p>
              {getDeliveryStatusBadge(order.delivery_status)}
            </div>
          </div>

          <Separator />

          {/* Customer Info - For Seller */}
          {isSeller && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  <span>Thông tin khách hàng</span>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{order.buyer_email || 'Không có email'}</span>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Payment Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CreditCard className="h-4 w-4" />
              <span>Thông tin thanh toán</span>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              {(() => {
                const original = product.price || 0;
                const discount = order.discount_amount || 0;
                const computedFinal = Math.max(0, original - discount);
                const finalAmount = order.bank_amount ?? computedFinal;
                
                return (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giá gốc:</span>
                      <span className={discount > 0 ? "line-through text-muted-foreground" : "font-medium"}>
                        {formatPrice(original)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Giảm giá:</span>
                        <span className="text-red-500">-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-semibold pt-2 border-t">
                      <span>Tổng thanh toán:</span>
                      <span className="text-marketplace-primary">{formatPrice(finalAmount)}</span>
                    </div>
                  </>
                );
              })()}
              {order.bank_transaction_id && (
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Mã giao dịch:</span>
                  <span className="font-mono">{order.bank_transaction_id}</span>
                </div>
              )}
              {order.payment_verified_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Xác thực lúc:</span>
                  <span>{formatDate(order.payment_verified_at)}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />
          <Separator />

          {/* Delivery Notes */}
          {order.delivery_notes && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  <span>Ghi chú giao hàng</span>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{order.delivery_notes}</p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Timeline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              <span>Lịch sử đơn hàng</span>
            </div>
            <OrderTimeline 
              status={order.status}
              deliveryStatus={order.delivery_status}
              createdAt={order.created_at}
              paidAt={order.payment_verified_at}
            />
          </div>

          <Separator />

          {/* Chat - mở sẵn trong modal, tự tạo khi gửi lần đầu */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MessageCircle className="h-4 w-4" />
              <span>Liên hệ {isSeller ? 'khách hàng' : 'người bán'}</span>
            </div>
            <OrderInlineChat
              order={order}
              sellerId={product.seller_id}
            />
          </div>

          <Separator />

          {/* Actions - Role-based permissions */}
          <div className="flex flex-wrap gap-3">
            {isSeller ? (
              <>
                {/* Seller can only update delivery status */}
                <UpdateDeliveryStatusButton 
                  orderId={order.id}
                  currentStatus={order.delivery_status}
                  currentNotes={order.delivery_notes}
                />
              </>
            ) : (
              <>
                {/* Buyer can only confirm completion or dispute */}
                <OrderConfirmButton
                  orderId={order.id}
                  status={order.status}
                  deliveryStatus={order.delivery_status}
                  variant="default"
                  size="default"
                />
                <OrderDisputeButton
                  orderId={order.id}
                  status={order.status}
                  deliveryStatus={order.delivery_status}
                  variant="outline"
                  size="default"
                />
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
