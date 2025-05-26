
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, ShoppingBag } from "lucide-react";

interface Product {
  id: string;
  title: string;
  image?: string;
  price: number;
  seller_name: string;
}

interface ChatConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product;
}

const ChatConfirmationModal = ({ isOpen, onClose, onConfirm, product }: ChatConfirmationModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Bắt đầu trò chuyện
          </DialogTitle>
          <DialogDescription>
            Bạn muốn chat với người bán về sản phẩm này?
          </DialogDescription>
        </DialogHeader>

        <Card className="border-0 bg-gray-50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShoppingBag className="h-6 w-6 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-2 mb-1">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-600">
                  Người bán: {product.seller_name}
                </p>
                <p className="text-lg font-semibold text-marketplace-primary">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(product.price)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? "Đang tạo..." : "Bắt đầu chat"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatConfirmationModal;
