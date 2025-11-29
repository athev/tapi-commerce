import { Button } from "@/components/ui/button";
import { Zap, ShoppingCart, Shield, Headphones, Lock, MessageSquare } from "lucide-react";
import { formatPrice } from "@/utils/orderUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProductCTAButtonsProps {
  currentPrice: number;
  onBuyNow: () => void;
  onServiceRequest?: () => void;
  isProcessing: boolean;
  hasPurchased: boolean;
  productType: string;
  isLoggedIn: boolean;
  productId?: string;
  onViewChat?: (conversationId: string) => void;
}

const ProductCTAButtons = ({ 
  currentPrice, 
  onBuyNow,
  onServiceRequest,
  isProcessing,
  hasPurchased,
  productType,
  isLoggedIn,
  productId,
  onViewChat
}: ProductCTAButtonsProps) => {
  const isMobile = useIsMobile();
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [checkingTicket, setCheckingTicket] = useState(false);

  useEffect(() => {
    const checkActiveTicket = async () => {
      if (!isLoggedIn || productType !== 'service' || !productId) return;
      
      setCheckingTicket(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('service_tickets')
          .select('id, status, conversation_id')
          .eq('buyer_id', user.id)
          .eq('product_id', productId)
          .in('status', ['pending', 'quoted', 'accepted', 'in_progress'])
          .maybeSingle();

        setActiveTicket(data);
      } catch (error) {
        console.error('Error checking active ticket:', error);
      } finally {
        setCheckingTicket(false);
      }
    };

    checkActiveTicket();
  }, [isLoggedIn, productType, productId]);

  // Hide on mobile (sticky bottom bar handles it) or after purchase for file_download
  if (isMobile || (hasPurchased && productType === 'file_download')) {
    return null;
  }

  // Service products have different CTA
  if (productType === 'service' && onServiceRequest) {
    // Show "View Request" button if active ticket exists
    if (activeTicket && onViewChat) {
      return (
        <Button 
          size="lg"
          className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg"
          onClick={() => onViewChat(activeTicket.conversation_id)}
          disabled={checkingTicket}
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          XEM YÊU CẦU CỦA BẠN
        </Button>
      );
    }

    // Show "Request Service" button
    return (
      <Button 
        size="lg"
        className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg"
        onClick={onServiceRequest}
        disabled={isProcessing || checkingTicket}
      >
        <Headphones className="h-5 w-5 mr-2" />
        YÊU CẦU DỊCH VỤ
      </Button>
    );
  }

  const buttonContent = isProcessing ? (
    <>
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
      Đang xử lý...
    </>
  ) : !isLoggedIn ? (
    <>
      <Lock className="h-5 w-5 mr-2" />
      ĐĂNG NHẬP ĐỂ MUA
    </>
  ) : (
    <>
      <Zap className="h-5 w-5 mr-2" />
      MUA NGAY
    </>
  );

  return (
    <div className="space-y-4">
      {/* Primary CTA */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="lg"
              className="w-full h-14 text-lg font-bold bg-destructive hover:bg-destructive/90 shadow-lg disabled:opacity-70"
              onClick={onBuyNow}
              disabled={isProcessing}
            >
              {buttonContent}
            </Button>
          </TooltipTrigger>
          {!isLoggedIn && (
            <TooltipContent>
              <p>Vui lòng đăng nhập để mua hàng và nhận quà tặng</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      {/* Minimal Trust Indicators */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3" /> Bảo mật 100%
        </span>
        <span className="flex items-center gap-1">
          <Zap className="h-3 w-3" /> Giao ngay
        </span>
        <span className="flex items-center gap-1">
          <Headphones className="h-3 w-3" /> Hỗ trợ 24/7
        </span>
      </div>
    </div>
  );
};

export default ProductCTAButtons;
