
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Clock, CheckCircle, TrendingUp, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const formatPI = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  }).format(amount) + " PI";
};

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const SellerWallet = () => {
  const { user, profile } = useAuth();

  // Fetch wallet data with better error handling
  const { data: wallet, isLoading: walletLoading, error: walletError, refetch: refetchWallet } = useQuery({
    queryKey: ['seller-wallet', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('No user found for wallet query');
        return null;
      }
      
      console.log('Fetching wallet for user:', user.id);
      
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching wallet:', error);
        throw error;
      }
      
      console.log('Wallet data:', data);
      return data;
    },
    enabled: !!user,
    retry: 3,
    retryDelay: 1000
  });

  // Fetch wallet logs
  const { data: walletLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['wallet-logs', wallet?.id],
    queryFn: async () => {
      if (!wallet) return [];
      
      const { data, error } = await supabase
        .from('wallet_logs')
        .select(`
          *,
          orders!inner(
            id,
            products!inner(title)
          )
        `)
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!wallet
  });

  // Auto-create wallet if user is seller but doesn't have one
  const { mutate: createWallet, isPending: isCreatingWallet } = useQuery({
    queryKey: ['create-wallet', user?.id],
    queryFn: async () => {
      if (!user || !profile || (profile.role !== 'seller' && profile.role !== 'admin')) {
        return null;
      }

      console.log('Creating wallet for seller:', user.id);
      
      const { data, error } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          pending: 0,
          available: 0,
          total_earned: 0
        })
        .select()
        .single();

      if (error) {
        // If wallet already exists, that's fine
        if (error.code === '23505') {
          console.log('Wallet already exists for user');
          return null;
        }
        console.error('Error creating wallet:', error);
        throw error;
      }

      console.log('Successfully created wallet:', data);
      // Refetch wallet data after creation
      setTimeout(() => refetchWallet(), 500);
      return data;
    },
    enabled: false // Only run manually
  });

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Bạn cần đăng nhập</h3>
          <p className="text-gray-500">Vui lòng đăng nhập để xem ví tiền.</p>
        </CardContent>
      </Card>
    );
  }

  if (walletLoading || isCreatingWallet) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (walletError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Wallet className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2 text-red-600">Lỗi tải ví tiền</h3>
          <p className="text-gray-500 mb-4">Có lỗi xảy ra khi tải thông tin ví tiền.</p>
          <Button onClick={() => refetchWallet()} variant="outline">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If no wallet and user is seller, try to create one
  if (!wallet && profile && (profile.role === 'seller' || profile.role === 'admin')) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Wallet className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Đang khởi tạo ví tiền</h3>
          <p className="text-gray-500 mb-4">
            Ví tiền đang được tạo tự động cho tài khoản người bán của bạn.
          </p>
          <Button onClick={() => refetchWallet()} variant="outline">
            Làm mới
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Chưa có ví tiền</h3>
          <p className="text-gray-500 mb-4">
            Ví tiền sẽ được tạo tự động khi bạn trở thành người bán.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Chờ xử lý</Badge>;
      case 'released':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Đã nhận</Badge>;
      case 'disputed':
        return <Badge variant="destructive"><TrendingUp className="h-3 w-3 mr-1" />Tranh chấp</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'earning':
        return 'Thu nhập bán hàng';
      case 'withdrawal':
        return 'Rút tiền';
      case 'dispute_hold':
        return 'Tạm giữ tranh chấp';
      case 'dispute_release':
        return 'Giải phóng tranh chấp';
      case 'dispute_refund':
        return 'Hoàn tiền tranh chấp';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">PI Chờ xử lý</p>
                <p className="text-2xl font-bold text-yellow-600">{formatPI(Number(wallet.pending))}</p>
                <p className="text-xs text-gray-500">{formatVND(Number(wallet.pending) * 1000)}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-50">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">PI Có thể rút</p>
                <p className="text-2xl font-bold text-green-600">{formatPI(Number(wallet.available))}</p>
                <p className="text-xs text-gray-500">{formatVND(Number(wallet.available) * 1000)}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng thu nhập</p>
                <p className="text-2xl font-bold text-blue-600">{formatPI(Number(wallet.total_earned))}</p>
                <p className="text-xs text-gray-500">{formatVND(Number(wallet.total_earned) * 1000)}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Rút tiền</h3>
              <p className="text-gray-500">Bạn có thể rút {formatPI(Number(wallet.available))} về tài khoản ngân hàng</p>
            </div>
            <Button 
              disabled={Number(wallet.available) <= 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Rút tiền
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : walletLogs && walletLogs.length > 0 ? (
            <div className="space-y-4">
              {walletLogs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">{getTypeLabel(log.type)}</span>
                      {getStatusBadge(log.status)}
                    </div>
                    <p className="text-sm text-gray-600">{log.description}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(log.created_at)}
                      {log.release_date && log.status === 'pending' && (
                        <span className="ml-2">
                          • Sẽ được giải phóng {formatDistanceToNow(new Date(log.release_date), { 
                            addSuffix: true, 
                            locale: vi 
                          })}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+{formatPI(Number(log.pi_amount))}</p>
                    <p className="text-xs text-gray-500">{formatVND(log.vnd_amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có giao dịch nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerWallet;
