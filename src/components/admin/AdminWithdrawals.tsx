import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useUserRoles } from "@/hooks/useUserRoles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WithdrawalStatus = "pending" | "approved" | "completed" | "rejected";

interface Withdrawal {
  id: string;
  user_id: string;
  wallet_id: string;
  pi_amount: number;
  vnd_amount: number;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  status: WithdrawalStatus;
  created_at: string;
  processed_at: string | null;
  rejection_reason: string | null;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

const AdminWithdrawals = () => {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "complete" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const queryClient = useQueryClient();
  const { data: userRoles } = useUserRoles();
  
  const isAdmin = userRoles?.includes('admin');
  const isAccountant = userRoles?.includes('accountant');

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: async () => {
      // Fetch withdrawal requests
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (withdrawalError) throw withdrawalError;
      if (!withdrawalData || withdrawalData.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(withdrawalData.map((w) => w.user_id))];

      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Create a map of user_id to profile
      const profilesMap = new Map(
        profilesData?.map((p) => [p.id, { full_name: p.full_name, email: p.email }])
      );

      // Combine data
      return withdrawalData.map((w) => ({
        ...w,
        profiles: profilesMap.get(w.user_id) || null,
      })) as Withdrawal[];
    },
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  const processWithdrawalMutation = useMutation({
    mutationFn: async ({
      withdrawalId,
      action,
      reason,
    }: {
      withdrawalId: string;
      action: "approve" | "reject" | "complete";
      reason?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("process-withdrawal", {
        body: {
          withdrawal_id: withdrawalId,
          action,
          rejection_reason: reason,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      const actionText =
        variables.action === "approve"
          ? "duyệt"
          : variables.action === "reject"
          ? "từ chối"
          : "hoàn tất";
      toast.success(`Đã ${actionText} lệnh rút tiền thành công`);
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });

  const handleAction = (withdrawal: Withdrawal, action: "approve" | "reject" | "complete") => {
    setSelectedWithdrawal(withdrawal);
    setActionType(action);
    setRejectionReason("");
  };

  const handleConfirmAction = () => {
    if (!selectedWithdrawal || !actionType) return;

    if (actionType === "reject" && !rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    processWithdrawalMutation.mutate({
      withdrawalId: selectedWithdrawal.id,
      action: actionType,
      reason: actionType === "reject" ? rejectionReason : undefined,
    });
  };

  const handleCloseDialog = () => {
    setSelectedWithdrawal(null);
    setActionType(null);
    setRejectionReason("");
  };

  const getStatusBadge = (status: WithdrawalStatus) => {
    const variants: Record<WithdrawalStatus, { variant: "default" | "secondary" | "destructive" | "outline"; text: string }> = {
      pending: { variant: "outline", text: "Chờ duyệt" },
      approved: { variant: "default", text: "Đã duyệt" },
      completed: { variant: "secondary", text: "Hoàn tất" },
      rejected: { variant: "destructive", text: "Từ chối" },
    };
    const { variant, text } = variants[status];
    return <Badge variant={variant}>{text}</Badge>;
  };

  const getActionButtons = (withdrawal: Withdrawal) => {
    if (withdrawal.status === "pending") {
      // Only admin can approve/reject
      if (!isAdmin) return <span className="text-muted-foreground text-sm">Chờ duyệt</span>;
      
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => handleAction(withdrawal, "approve")}
          >
            Duyệt
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleAction(withdrawal, "reject")}
          >
            Từ chối
          </Button>
        </div>
      );
    }

    if (withdrawal.status === "approved") {
      // Both admin and accountant can complete
      if (!isAdmin && !isAccountant) return <span className="text-muted-foreground text-sm">Đã duyệt</span>;
      
      return (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleAction(withdrawal, "complete")}
        >
          Đã chuyển tiền
        </Button>
      );
    }

    return <span className="text-muted-foreground text-sm">Đã xử lý</span>;
  };

  const getDialogContent = () => {
    if (!selectedWithdrawal || !actionType) return null;

    const actionTexts = {
      approve: {
        title: "Xác nhận duyệt lệnh rút tiền",
        description: "Bạn chắc chắn muốn duyệt lệnh rút tiền này? Số tiền sẽ được trừ khỏi tổng thu nhập của seller.",
      },
      reject: {
        title: "Xác nhận từ chối lệnh rút tiền",
        description: "Vui lòng nhập lý do từ chối. Số tiền sẽ được hoàn lại vào số dư khả dụng của seller.",
      },
      complete: {
        title: "Xác nhận đã chuyển tiền",
        description: "Bạn đã chuyển tiền thành công cho seller qua ngân hàng?",
      },
    };

    return actionTexts[actionType];
  };

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  const dialogContent = getDialogContent();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quản lý rút tiền</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seller</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Ngân hàng</TableHead>
                  <TableHead>Số TK</TableHead>
                  <TableHead>Chủ TK</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Chưa có lệnh rút tiền nào
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawals?.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{withdrawal.profiles?.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {withdrawal.profiles?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {withdrawal.vnd_amount.toLocaleString("vi-VN")} đ
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {withdrawal.pi_amount.toFixed(2)} PI
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{withdrawal.bank_name}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {withdrawal.bank_account_number}
                      </TableCell>
                      <TableCell>{withdrawal.bank_account_name}</TableCell>
                      <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                      <TableCell>
                        {format(new Date(withdrawal.created_at), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })}
                      </TableCell>
                      <TableCell>{getActionButtons(withdrawal)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedWithdrawal && !!actionType} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent?.title}</DialogTitle>
            <DialogDescription>{dialogContent?.description}</DialogDescription>
          </DialogHeader>

          {actionType === "reject" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Lý do từ chối *</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                rows={4}
              />
            </div>
          )}

          {selectedWithdrawal && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seller:</span>
                <span className="font-medium">{selectedWithdrawal.profiles?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số tiền:</span>
                <span className="font-medium">
                  {selectedWithdrawal.vnd_amount.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngân hàng:</span>
                <span className="font-medium">{selectedWithdrawal.bank_name}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Hủy
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={processWithdrawalMutation.isPending}
            >
              {processWithdrawalMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminWithdrawals;
