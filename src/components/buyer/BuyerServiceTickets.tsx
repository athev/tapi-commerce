import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MessageSquare, DollarSign, Clock, Package } from "lucide-react";
import { formatPrice } from "@/utils/orderUtils";

interface ServiceTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  quoted_price?: number;
  created_at: string;
  seller_id: string;
  conversation_id: string;
  products?: { title: string };
  profiles?: { full_name: string };
}

const BuyerServiceTickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('service_tickets')
        .select(`
          *,
          products(title)
        `)
        .eq('buyer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch seller profiles separately
      if (data && data.length > 0) {
        const sellerIds = [...new Set(data.map(t => t.seller_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', sellerIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        const ticketsWithProfiles = data.map(ticket => ({
          ...ticket,
          profiles: profileMap.get(ticket.seller_id)
        }));
        setTickets(ticketsWithProfiles);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return ticket.status === "pending" || ticket.status === "quoted";
    if (activeTab === "in_progress") return ticket.status === "in_progress" || ticket.status === "accepted";
    if (activeTab === "completed") return ticket.status === "completed";
    return true;
  });

  const statusConfig = {
    pending: { label: 'Chờ báo giá', color: 'bg-yellow-500' },
    quoted: { label: 'Đã báo giá', color: 'bg-blue-500' },
    accepted: { label: 'Đã chấp nhận', color: 'bg-purple-500' },
    in_progress: { label: 'Đang xử lý', color: 'bg-orange-500' },
    completed: { label: 'Hoàn thành', color: 'bg-green-500' },
    cancelled: { label: 'Đã hủy', color: 'bg-gray-500' }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Package className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold">Yêu cầu dịch vụ của tôi</h2>
          <p className="text-muted-foreground">Theo dõi các yêu cầu dịch vụ đã tạo</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tất cả ({tickets.length})</TabsTrigger>
          <TabsTrigger value="pending">Chờ xử lý</TabsTrigger>
          <TabsTrigger value="in_progress">Đang xử lý</TabsTrigger>
          <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 space-y-4">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Bạn chưa có yêu cầu dịch vụ nào
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket) => {
              const config = statusConfig[ticket.status as keyof typeof statusConfig];
              return (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {ticket.products?.title || ticket.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Người bán: {ticket.profiles?.full_name || "N/A"}
                        </p>
                      </div>
                      <Badge className={`${config?.color} text-white`}>
                        {config?.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(ticket.created_at).toLocaleDateString('vi-VN')}
                      </div>
                      {ticket.quoted_price && (
                        <div className="flex items-center gap-1 text-primary font-semibold">
                          <DollarSign className="h-4 w-4" />
                          {formatPrice(ticket.quoted_price)}
                        </div>
                      )}
                    </div>

                    <Button 
                      onClick={() => navigate(`/chat/${ticket.conversation_id}`)}
                      size="sm"
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Xem chi tiết & Chat
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BuyerServiceTickets;
