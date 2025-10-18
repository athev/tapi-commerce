
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import WalletSummaryCards from "./WalletSummaryCards";
import WithdrawalSection from "./WithdrawalSection";
import WithdrawalHistory from "./WithdrawalHistory";
import TransactionHistory from "./TransactionHistory";

const SellerWallet = () => {
  const { user, profile } = useAuth();

  // Fetch wallet data với refetch interval để cập nhật real-time
  const { data: wallet, isLoading: walletLoading, error: walletError, refetch: refetchWallet } = useQuery({
    queryKey: ['seller-wallet', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('No user found for wallet query');
        return null;
      }
      
      console.log('🔍 Fetching wallet for user:', user.id);
      
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Error fetching wallet:', error);
        throw error;
      }
      
      console.log('💰 Wallet data fetched:', data);
      return data;
    },
    enabled: !!user,
    retry: 3,
    retryDelay: 1000,
    refetchInterval: 30000, // Refresh mỗi 30 giây để cập nhật real-time
    refetchOnWindowFocus: true
  });

  // Fetch wallet logs với dependency đúng
  const { data: walletLogs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['wallet-logs', wallet?.id],
    queryFn: async () => {
      if (!wallet) {
        console.log('No wallet found for logs query');
        return [];
      }
      
      console.log('📋 Fetching wallet logs for wallet:', wallet.id);
      
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
      
      if (error) {
        console.error('❌ Error fetching wallet logs:', error);
        throw error;
      }
      
      console.log('📊 Wallet logs fetched:', data?.length, 'records');
      return data || [];
    },
    enabled: !!wallet,
    refetchInterval: 30000, // Refresh mỗi 30 giây
    refetchOnWindowFocus: true
  });

  // Auto-refresh function
  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    refetchWallet();
    if (wallet) {
      refetchLogs();
    }
  };

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

  if (walletLoading) {
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
          <Button onClick={handleRefresh} variant="outline">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If no wallet and user is seller, show message about wallet creation
  if (!wallet && profile && (profile.role === 'seller' || profile.role === 'admin')) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Wallet className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Ví tiền đang được tạo</h3>
          <p className="text-gray-500 mb-4">
            Ví tiền sẽ được tạo tự động khi bạn có đơn hàng đầu tiên.
          </p>
          <Button onClick={handleRefresh} variant="outline">
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ví PI của tôi</h2>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          🔄 Làm mới
        </Button>
      </div>
      
      <WalletSummaryCards wallet={wallet} />
      
      <WithdrawalSection 
        availablePI={Number(wallet.available)} 
        onWithdrawalSuccess={() => {
          refetchWallet();
          refetchLogs();
        }}
      />
      
      <WithdrawalHistory />
      
      <TransactionHistory walletLogs={walletLogs || []} isLoading={logsLoading} />
    </div>
  );
};

export default SellerWallet;
