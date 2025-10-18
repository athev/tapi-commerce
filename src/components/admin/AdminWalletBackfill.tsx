import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Database, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export const AdminWalletBackfill = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleBackfill = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Lỗi xác thực",
          description: "Vui lòng đăng nhập lại",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('backfill-wallet-data', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`
        }
      });

      if (error) throw error;

      setResult(data.results);
      
      toast({
        title: "Backfill hoàn tất",
        description: `Đã xử lý ${data.results.processed}/${data.results.total_orders} đơn hàng`,
      });
    } catch (error: any) {
      console.error('Backfill error:', error);
      toast({
        title: "Lỗi backfill",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Wallet Data Backfill
        </CardTitle>
        <CardDescription>
          Xử lý lại dữ liệu PI cho các đơn hàng cũ chưa có wallet logs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Chức năng này sẽ tìm tất cả đơn hàng đã thanh toán nhưng chưa có wallet logs,
            sau đó tính toán và cộng PI vào ví pending của người bán.
          </AlertDescription>
        </Alert>

        <Button
          onClick={handleBackfill}
          disabled={isProcessing}
          size="lg"
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Chạy Backfill
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{result.total_orders}</div>
                    <div className="text-sm text-muted-foreground">Tổng đơn</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-5 w-5" />
                      {result.processed}
                    </div>
                    <div className="text-sm text-muted-foreground">Thành công</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {result.skipped}
                    </div>
                    <div className="text-sm text-muted-foreground">Đã có log</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                      <XCircle className="h-5 w-5" />
                      {result.errors}
                    </div>
                    <div className="text-sm text-muted-foreground">Lỗi</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Chi tiết xử lý</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {result.details.map((detail: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {detail.status === 'success' && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                        {detail.status === 'skipped' && (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                        {detail.status === 'error' && (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <code className="text-xs">{detail.order_id.substring(0, 8)}</code>
                      </div>
                      <div className="text-right">
                        {detail.status === 'success' && (
                          <span className="text-green-600 font-medium">
                            +{detail.pi_amount} PI
                          </span>
                        )}
                        {detail.status === 'skipped' && (
                          <span className="text-muted-foreground text-xs">
                            {detail.reason}
                          </span>
                        )}
                        {detail.status === 'error' && (
                          <span className="text-red-600 text-xs">
                            {detail.reason}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
