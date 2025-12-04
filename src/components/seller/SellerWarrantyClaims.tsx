import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  MessageSquare,
  RefreshCw,
  Timer,
  Shield
} from "lucide-react";
import { format, differenceInSeconds, addHours } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface WarrantyClaim {
  id: string;
  title: string;
  description: string;
  claim_type: string;
  status: string;
  created_at: string;
  deadline_at: string;
  extended_deadline_at: string | null;
  resolution_notes: string | null;
  conversation_id: string | null;
  order_id: string;
  product_id: string;
  buyer_id: string;
  warranty_expires_at: string;
  orders: {
    id: string;
    bank_amount: number | null;
    products: {
      title: string;
      image: string | null;
    };
  };
  profiles: {
    full_name: string;
    email: string;
  };
}

const ClaimStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "Chờ xử lý", variant: "default" },
    in_progress: { label: "Đang xử lý", variant: "secondary" },
    resolved: { label: "Đã giải quyết", variant: "outline" },
    rejected: { label: "Từ chối", variant: "destructive" },
    expired: { label: "Hết hạn", variant: "destructive" },
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const ClaimTypeBadge = ({ type }: { type: string }) => {
  const typeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
    repair: { label: "Sửa chữa", icon: <RefreshCw className="h-3 w-3" /> },
    replace: { label: "Đổi mới", icon: <Shield className="h-3 w-3" /> },
    refund: { label: "Hoàn tiền", icon: <CheckCircle className="h-3 w-3" /> },
  };
  
  const config = typeConfig[type] || typeConfig.repair;
  return (
    <Badge variant="outline" className="gap-1">
      {config.icon}
      {config.label}
    </Badge>
  );
};

const CountdownTimer = ({ deadlineAt, extendedDeadlineAt }: { deadlineAt: string; extendedDeadlineAt: string | null }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  const effectiveDeadline = extendedDeadlineAt || deadlineAt;
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const deadline = new Date(effectiveDeadline);
      const now = new Date();
      const diff = differenceInSeconds(deadline, now);
      setTimeLeft(Math.max(0, diff));
    };
    
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [effectiveDeadline]);
  
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  
  const isUrgent = timeLeft > 0 && timeLeft < 3600; // < 1 hour
  const isExpired = timeLeft === 0;
  
  if (isExpired) {
    return (
      <div className="flex items-center gap-1 text-destructive font-medium">
        <AlertTriangle className="h-4 w-4" />
        <span>Hết hạn xử lý!</span>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-1 font-mono text-sm ${isUrgent ? 'text-orange-500' : 'text-muted-foreground'}`}>
      <Timer className="h-4 w-4" />
      <span>
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      {extendedDeadlineAt && (
        <Badge variant="outline" className="ml-1 text-xs">Đã gia hạn</Badge>
      )}
    </div>
  );
};

const SellerWarrantyClaims = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);
  const [actionType, setActionType] = useState<'resolve' | 'reject' | 'extend' | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [extendHours, setExtendHours] = useState("24");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: claims, isLoading } = useQuery({
    queryKey: ['seller-warranty-claims', user?.id, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('warranty_claims')
        .select(`
          *,
          orders!warranty_claims_order_id_fkey (
            id,
            bank_amount,
            products!orders_product_id_fkey (
              title,
              image
            )
          ),
          profiles:buyer_id (
            full_name,
            email
          )
        `)
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as WarrantyClaim[];
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ claimId, notes }: { claimId: string; notes: string }) => {
      const { error } = await supabase
        .from('warranty_claims')
        .update({
          status: 'resolved',
          resolution_notes: notes,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', claimId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Đã giải quyết yêu cầu bảo hành");
      queryClient.invalidateQueries({ queryKey: ['seller-warranty-claims'] });
      closeDialog();
    },
    onError: () => {
      toast.error("Lỗi khi xử lý yêu cầu");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ claimId, notes }: { claimId: string; notes: string }) => {
      const { error } = await supabase
        .from('warranty_claims')
        .update({
          status: 'rejected',
          resolution_notes: notes,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', claimId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Đã từ chối yêu cầu bảo hành");
      queryClient.invalidateQueries({ queryKey: ['seller-warranty-claims'] });
      closeDialog();
    },
    onError: () => {
      toast.error("Lỗi khi xử lý yêu cầu");
    },
  });

  const extendMutation = useMutation({
    mutationFn: async ({ claimId, hours }: { claimId: string; hours: number }) => {
      const newDeadline = addHours(new Date(), hours);
      const { error } = await supabase
        .from('warranty_claims')
        .update({
          extended_deadline_at: newDeadline.toISOString(),
          status: 'in_progress',
        })
        .eq('id', claimId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Đã gia hạn thời gian xử lý");
      queryClient.invalidateQueries({ queryKey: ['seller-warranty-claims'] });
      closeDialog();
    },
    onError: () => {
      toast.error("Lỗi khi gia hạn");
    },
  });

  const closeDialog = () => {
    setSelectedClaim(null);
    setActionType(null);
    setResolutionNotes("");
    setExtendHours("24");
  };

  const handleAction = () => {
    if (!selectedClaim) return;
    
    if (actionType === 'resolve') {
      resolveMutation.mutate({ claimId: selectedClaim.id, notes: resolutionNotes });
    } else if (actionType === 'reject') {
      rejectMutation.mutate({ claimId: selectedClaim.id, notes: resolutionNotes });
    } else if (actionType === 'extend') {
      extendMutation.mutate({ claimId: selectedClaim.id, hours: parseInt(extendHours) });
    }
  };

  const openChat = (conversationId: string | null) => {
    if (conversationId) {
      navigate(`/chat/${conversationId}`);
    }
  };

  const pendingCount = claims?.filter(c => c.status === 'pending').length || 0;
  const inProgressCount = claims?.filter(c => c.status === 'in_progress').length || 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quản lý Yêu cầu Bảo hành
            </CardTitle>
            <div className="flex items-center gap-4">
              {pendingCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {pendingCount} chờ xử lý
                </Badge>
              )}
              {inProgressCount > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {inProgressCount} đang xử lý
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="in_progress">Đang xử lý</SelectItem>
                <SelectItem value="resolved">Đã giải quyết</SelectItem>
                <SelectItem value="rejected">Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!claims || claims.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có yêu cầu bảo hành nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <Card key={claim.id} className={`${claim.status === 'pending' ? 'border-orange-200 bg-orange-50/50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={claim.orders?.products?.image || '/placeholder.svg'}
                          alt={claim.orders?.products?.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>
                      
                      {/* Claim Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-medium truncate">{claim.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {claim.orders?.products?.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClaimTypeBadge type={claim.claim_type} />
                            <ClaimStatusBadge status={claim.status} />
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {claim.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span>Khách: {claim.profiles?.full_name}</span>
                            <span>
                              Ngày tạo: {format(new Date(claim.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </span>
                          </div>
                          
                          {(claim.status === 'pending' || claim.status === 'in_progress') && (
                            <CountdownTimer 
                              deadlineAt={claim.deadline_at} 
                              extendedDeadlineAt={claim.extended_deadline_at}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    {(claim.status === 'pending' || claim.status === 'in_progress') && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSelectedClaim(claim);
                            setActionType('resolve');
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Giải quyết
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedClaim(claim);
                            setActionType('extend');
                          }}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Gia hạn
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedClaim(claim);
                            setActionType('reject');
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Từ chối
                        </Button>
                        {claim.conversation_id && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openChat(claim.conversation_id)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {/* Resolution Notes */}
                    {claim.resolution_notes && (claim.status === 'resolved' || claim.status === 'rejected') && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          <strong>Ghi chú xử lý:</strong> {claim.resolution_notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'resolve' && 'Giải quyết yêu cầu bảo hành'}
              {actionType === 'reject' && 'Từ chối yêu cầu bảo hành'}
              {actionType === 'extend' && 'Gia hạn thời gian xử lý'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {actionType === 'extend' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Thêm thời gian (giờ)</label>
                <Select value={extendHours} onValueChange={setExtendHours}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 giờ</SelectItem>
                    <SelectItem value="24">24 giờ</SelectItem>
                    <SelectItem value="48">48 giờ</SelectItem>
                    <SelectItem value="72">72 giờ</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Gia hạn thời gian để thương lượng hoặc xử lý vấn đề phức tạp
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Ghi chú {actionType === 'resolve' ? 'giải quyết' : 'từ chối'} *
                </label>
                <Textarea
                  placeholder={
                    actionType === 'resolve' 
                      ? "Mô tả cách bạn đã giải quyết vấn đề..." 
                      : "Lý do từ chối yêu cầu bảo hành..."
                  }
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Hủy
            </Button>
            <Button
              onClick={handleAction}
              disabled={
                (actionType !== 'extend' && !resolutionNotes.trim()) ||
                resolveMutation.isPending ||
                rejectMutation.isPending ||
                extendMutation.isPending
              }
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {actionType === 'resolve' && 'Xác nhận giải quyết'}
              {actionType === 'reject' && 'Xác nhận từ chối'}
              {actionType === 'extend' && 'Gia hạn'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerWarrantyClaims;
