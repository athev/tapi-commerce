import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Gift, ArrowDown, ArrowUp, Loader2, Star, Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PILog {
  id: string;
  pi_amount: number;
  type: string;
  description: string;
  created_at: string;
}

const REDEMPTION_TIERS = [
  { pi: 10, vnd: 10000, bonus: 0, label: "10 PI → 10.000đ" },
  { pi: 50, vnd: 55000, bonus: 10, label: "50 PI → 55.000đ (+10%)" },
  { pi: 100, vnd: 120000, bonus: 20, label: "100 PI → 120.000đ (+20%)" },
];

const BuyerPIWallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<{ pi_balance: number; total_earned: number } | null>(null);
  const [logs, setLogs] = useState<PILog[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("10");

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      // Fetch wallet
      const { data: walletData } = await supabase
        .from('buyer_wallets')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      setWallet(walletData);

      if (walletData) {
        // Fetch logs
        const { data: logsData } = await supabase
          .from('buyer_pi_logs')
          .select('*')
          .eq('buyer_wallet_id', walletData.id)
          .order('created_at', { ascending: false })
          .limit(20);

        setLogs(logsData || []);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    const tier = REDEMPTION_TIERS.find(t => t.pi.toString() === selectedTier);
    if (!tier) return;

    if (!wallet || wallet.pi_balance < tier.pi) {
      toast({
        title: "Không đủ PI",
        description: `Bạn cần ${tier.pi} PI để đổi voucher này`,
        variant: "destructive"
      });
      return;
    }

    setRedeeming(true);
    try {
      const { data, error } = await supabase.functions.invoke('redeem-pi-voucher', {
        body: {
          pi_amount: tier.pi,
          vnd_value: tier.vnd
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Đổi voucher thành công! 🎉",
          description: `Mã voucher: ${data.voucher_code}. Giá trị: ${tier.vnd.toLocaleString('vi-VN')}đ`
        });
        fetchWalletData();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Không thể đổi voucher",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Số dư PI</p>
              <div className="flex items-center gap-2">
                <Coins className="h-8 w-8 text-primary" />
                <span className="text-4xl font-bold text-primary">
                  {wallet?.pi_balance || 0}
                </span>
                <span className="text-lg text-muted-foreground">PI</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Tổng đã kiếm</p>
              <p className="text-2xl font-semibold">{wallet?.total_earned || 0} PI</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redemption Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Đổi PI lấy Voucher
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {REDEMPTION_TIERS.map((tier) => (
              <div
                key={tier.pi}
                className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedTier === tier.pi.toString()
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedTier(tier.pi.toString())}
              >
                <div className="flex items-center gap-3">
                  <Ticket className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{tier.pi} PI</p>
                    {tier.bonus > 0 && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        +{tier.bonus}% bonus
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    {tier.vnd.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleRedeem}
            className="w-full"
            size="lg"
            disabled={redeeming || !wallet || wallet.pi_balance < parseInt(selectedTier)}
          >
            {redeeming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Gift className="h-4 w-4 mr-2" />
                Đổi Voucher Ngay
              </>
            )}
          </Button>

          {wallet && wallet.pi_balance < parseInt(selectedTier) && (
            <p className="text-sm text-center text-muted-foreground">
              Bạn cần thêm {parseInt(selectedTier) - wallet.pi_balance} PI để đổi voucher này
            </p>
          )}
        </CardContent>
      </Card>

      {/* How to Earn */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cách kiếm PI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="bg-yellow-100 rounded-full p-2">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium">Đánh giá sản phẩm</p>
              <p className="text-sm text-muted-foreground">
                +1 PI cho mỗi đánh giá 5 sao sau khi mua hàng
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lịch Sử Giao Dịch PI</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Chưa có giao dịch nào
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-3 border-b last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${
                      log.type === 'review_reward' 
                        ? 'bg-green-100' 
                        : 'bg-orange-100'
                    }`}>
                      {log.type === 'review_reward' ? (
                        <ArrowDown className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowUp className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{log.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${
                    log.pi_amount > 0 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {log.pi_amount > 0 ? '+' : ''}{log.pi_amount} PI
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerPIWallet;
