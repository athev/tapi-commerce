import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle, LogOut, ChevronRight, ArrowLeft } from "lucide-react";
import MobileProfileHeader from "./MobileProfileHeader";
import OrderStatusQuickAccess from "./OrderStatusQuickAccess";
import MobileUtilitiesSection from "./MobileUtilitiesSection";
import MobileOrderList from "./MobileOrderList";
import BuyerPIWallet from "@/components/buyer/BuyerPIWallet";
import BuyerServiceTickets from "@/components/buyer/BuyerServiceTickets";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";
import ReviewModal from "@/components/reviews/ReviewModal";
import ZaloLinkSection from "./ZaloLinkSection";

type ViewType = 'profile' | 'orders' | 'pi-wallet' | 'services';

interface MobileProfilePageProps {
  orders: any[];
  reviewedOrders: string[];
  onRefetchReviews: () => void;
}

const MobileProfilePage = ({ orders, reviewedOrders, onRefetchReviews }: MobileProfilePageProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<ViewType>('profile');
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [reviewOrder, setReviewOrder] = useState<any>(null);
  const [localReviewedOrders, setLocalReviewedOrders] = useState<Set<string>>(new Set(reviewedOrders));

  // Fetch PI wallet balance
  const { data: piWallet } = useQuery({
    queryKey: ['buyer-pi-wallet', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('buyer_wallets')
        .select('pi_balance')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Fetch service tickets count
  const { data: ticketsCount } = useQuery({
    queryKey: ['buyer-tickets-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from('service_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user.id)
        .in('status', ['pending', 'quoted', 'accepted', 'in_progress']);
      return count || 0;
    },
    enabled: !!user,
  });

  // Fetch favorites count
  const { data: favoritesCount } = useQuery({
    queryKey: ['favorites-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      return count || 0;
    },
    enabled: !!user,
  });

  // Calculate order status counts
  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'paid' && o.delivery_status === 'processing').length,
    delivered: orders.filter(o => o.status === 'paid' && o.delivery_status === 'delivered').length,
    needReview: orders.filter(o => 
      o.status === 'paid' && 
      o.delivery_status === 'completed' && 
      !reviewedOrders.includes(o.id) &&
      !localReviewedOrders.has(o.id)
    ).length,
  };

  const handleStatusClick = (status: string) => {
    setOrderFilter(status === 'review' ? 'completed' : status);
    setView('orders');
  };

  const handleReviewOrder = (order: any) => {
    setReviewOrder({
      id: order.id,
      product_id: order.product_id,
      product_title: order.product?.title,
      product_image: order.product?.image,
      variant_name: order.variant?.variant_name || order.buyer_data?.variant_name
    });
  };

  const handleReviewSuccess = () => {
    if (reviewOrder) {
      setLocalReviewedOrders(prev => new Set([...prev, reviewOrder.id]));
      onRefetchReviews();
    }
    setReviewOrder(null);
  };

  // Render different views
  if (view === 'orders') {
    return (
      <MobileOrderList
        orders={orders}
        reviewedOrders={[...reviewedOrders, ...Array.from(localReviewedOrders)]}
        initialFilter={orderFilter}
        onBack={() => setView('profile')}
        onViewDetails={setSelectedOrder}
        onReview={handleReviewOrder}
      />
    );
  }

  if (view === 'pi-wallet') {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="sticky top-0 bg-background z-10 border-b p-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView('profile')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Ví PI</span>
        </div>
        <ScrollArea className="flex-1 p-4">
          <BuyerPIWallet />
        </ScrollArea>
      </div>
    );
  }

  if (view === 'services') {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="sticky top-0 bg-background z-10 border-b p-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView('profile')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Yêu cầu dịch vụ</span>
        </div>
        <ScrollArea className="flex-1 p-4">
          <BuyerServiceTickets />
        </ScrollArea>
      </div>
    );
  }

  // Main Profile View
  return (
    <div className="min-h-screen bg-accent/30 pb-20">
      <MobileProfileHeader 
        orderCount={orders.length}
        piBalance={piWallet?.pi_balance || 0}
      />
      
      <OrderStatusQuickAccess 
        counts={statusCounts}
        onViewAll={() => setView('orders')}
        onStatusClick={handleStatusClick}
      />
      
      <MobileUtilitiesSection
        piBalance={piWallet?.pi_balance || 0}
        ticketCount={ticketsCount || 0}
        favoriteCount={favoritesCount || 0}
        onPIWallet={() => setView('pi-wallet')}
        onServices={() => setView('services')}
        onFavorites={() => navigate('/favorites')}
        onVouchers={() => {}}
      />

      {/* Zalo Notification Section */}
      <div className="p-4">
        <ZaloLinkSection />
      </div>

      {/* Support Section */}
      <div className="p-4 pt-0">
        <h3 className="font-semibold mb-3">Hỗ trợ</h3>
        <Card className="divide-y">
          <button className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Trung tâm trợ giúp</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button 
            className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors text-destructive"
            onClick={() => signOut()}
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5" />
              <span className="text-sm">Đăng xuất</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </button>
        </Card>
      </div>

      {/* Modals */}
      {selectedOrder && (
        <OrderDetailsModal
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
          order={selectedOrder}
        />
      )}

      {reviewOrder && (
        <ReviewModal
          open={!!reviewOrder}
          onOpenChange={(open) => !open && setReviewOrder(null)}
          order={reviewOrder}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default MobileProfilePage;
