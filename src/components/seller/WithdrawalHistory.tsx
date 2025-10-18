import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";

const WithdrawalHistory = () => {
  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['withdrawal-history'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000 // Refresh every 30s
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Chờ duyệt</Badge>;
      case 'approved':
        return <Badge className="gap-1 bg-blue-500"><Clock className="h-3 w-3" />Đã duyệt</Badge>;
      case 'completed':
        return <Badge className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" />Hoàn tất</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử rút tiền</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Đang tải...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử rút tiền</CardTitle>
      </CardHeader>
      <CardContent>
        {!withdrawals || withdrawals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Chưa có lịch sử rút tiền</p>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-lg">
                      {withdrawal.pi_amount.toLocaleString('vi-VN')} PI
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {withdrawal.vnd_amount.toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                  {getStatusBadge(withdrawal.status)}
                </div>

                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Ngân hàng:</span>{" "}
                    <span className="font-medium">{withdrawal.bank_name}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Số TK:</span>{" "}
                    <span className="font-medium">{withdrawal.bank_account_number}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Chủ TK:</span>{" "}
                    <span className="font-medium">{withdrawal.bank_account_name}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Ngày tạo: {format(new Date(withdrawal.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                  {withdrawal.processed_at && (
                    <p className="text-muted-foreground">
                      Xử lý: {format(new Date(withdrawal.processed_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </p>
                  )}
                </div>

                {withdrawal.rejection_reason && (
                  <div className="bg-destructive/10 text-destructive rounded p-2 text-sm">
                    <p className="font-medium">Lý do từ chối:</p>
                    <p>{withdrawal.rejection_reason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WithdrawalHistory;