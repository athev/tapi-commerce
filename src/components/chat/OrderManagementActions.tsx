
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Send, 
  User, 
  Package, 
  CheckCircle,
  Upload,
  Key,
  UserPlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Order {
  id: string;
  status: string;
  created_at: string;
  delivery_status?: string;
  buyer_email?: string;
  products?: {
    title: string;
    price: number;
    product_type?: string;
  };
  user_id: string;
}

interface OrderManagementActionsProps {
  order: Order;
  onStatusUpdate?: () => void;
}

const OrderManagementActions = ({ order, onStatusUpdate }: OrderManagementActionsProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualData, setManualData] = useState({
    account_info: '',
    password: '',
    license_key: '',
    download_link: '',
    instructions: ''
  });

  const updateOrderStatus = async (newStatus: string, deliveryNotes?: string) => {
    try {
      setIsProcessing(true);
      
      const { error } = await supabase
        .from('orders')
        .update({
          delivery_status: newStatus,
          delivery_notes: deliveryNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: "Cập nhật thành công",
        description: `Trạng thái đơn hàng đã được cập nhật: ${newStatus}`,
        variant: "default"
      });

      onStatusUpdate?.();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái đơn hàng",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendFile = async () => {
    await updateOrderStatus('delivered', 'File đã được gửi lại cho khách hàng');
  };

  const handleManualDelivery = async () => {
    const deliveryInfo = [];
    
    if (manualData.account_info) deliveryInfo.push(`Tài khoản: ${manualData.account_info}`);
    if (manualData.password) deliveryInfo.push(`Mật khẩu: ${manualData.password}`);
    if (manualData.license_key) deliveryInfo.push(`License Key: ${manualData.license_key}`);
    if (manualData.download_link) deliveryInfo.push(`Link tải: ${manualData.download_link}`);
    if (manualData.instructions) deliveryInfo.push(`Hướng dẫn: ${manualData.instructions}`);

    const deliveryNotes = `Thông tin đã gửi thủ công:\n${deliveryInfo.join('\n')}`;
    
    await updateOrderStatus('delivered', deliveryNotes);
    setShowManualForm(false);
    setManualData({
      account_info: '',
      password: '',
      license_key: '',
      download_link: '',
      instructions: ''
    });
  };

  const getProductTypeActions = () => {
    const productType = order.products?.product_type || 'file_download';
    
    switch (productType) {
      case 'file_download':
        return (
          <Button
            onClick={handleResendFile}
            disabled={isProcessing}
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isProcessing ? "Đang gửi..." : "Gửi lại file"}
          </Button>
        );
      
      case 'license_key_delivery':
      case 'shared_account':
      case 'upgrade_account_no_pass':
      case 'upgrade_account_with_pass':
        return (
          <Button
            onClick={() => setShowManualForm(!showManualForm)}
            variant="outline"
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Gửi thông tin thủ công
          </Button>
        );
      
      default:
        return (
          <Button
            onClick={() => updateOrderStatus('delivered', 'Đơn hàng đã được xử lý')}
            disabled={isProcessing}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isProcessing ? "Đang xử lý..." : "Đánh dấu đã xử lý"}
          </Button>
        );
    }
  };

  const getDeliveryStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusMap = {
      'pending': { label: 'Chờ xử lý', variant: 'secondary' as const },
      'processing': { label: 'Đang xử lý', variant: 'default' as const },
      'delivered': { label: 'Đã giao', variant: 'default' as const },
      'failed': { label: 'Giao thất bại', variant: 'destructive' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const isDelivered = order.delivery_status === 'delivered';

  return (
    <Card className="border-l-4 border-l-orange-500 mb-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5 text-orange-600" />
          Quản lý đơn hàng #{order.id.slice(0, 8)}
          {getDeliveryStatusBadge(order.delivery_status)}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Customer Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-sm">Thông tin khách hàng</span>
          </div>
          <p className="text-sm text-gray-600">
            Email: {order.buyer_email || 'Không có thông tin'}
          </p>
        </div>

        {/* Product Info */}
        {order.products && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">{order.products.title}</h4>
            <p className="text-sm text-gray-600">
              Giá: {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(order.products.price)}
            </p>
            <p className="text-sm text-gray-500">
              Loại: {order.products.product_type === 'file_download' ? 'File tải xuống' :
                     order.products.product_type === 'license_key_delivery' ? 'License Key' :
                     order.products.product_type === 'shared_account' ? 'Tài khoản chia sẻ' :
                     order.products.product_type === 'upgrade_account_no_pass' ? 'Nâng cấp tài khoản' :
                     order.products.product_type === 'upgrade_account_with_pass' ? 'Nâng cấp tài khoản có mật khẩu' :
                     'Khác'}
            </p>
          </div>
        )}

        {/* Action buttons - only show if not delivered yet */}
        {!isDelivered && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Hành động xử lý:</div>
            {getProductTypeActions()}
          </div>
        )}

        {/* Manual delivery form */}
        {showManualForm && !isDelivered && (
          <Card className="bg-gray-50">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm">Gửi thông tin thủ công</h4>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="account_info" className="text-xs">Thông tin tài khoản</Label>
                  <Input
                    id="account_info"
                    value={manualData.account_info}
                    onChange={(e) => setManualData(prev => ({ ...prev, account_info: e.target.value }))}
                    placeholder="Username hoặc email tài khoản"
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-xs">Mật khẩu</Label>
                  <Input
                    id="password"
                    type="password"
                    value={manualData.password}
                    onChange={(e) => setManualData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Mật khẩu tài khoản"
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="license_key" className="text-xs">License Key</Label>
                  <Input
                    id="license_key"
                    value={manualData.license_key}
                    onChange={(e) => setManualData(prev => ({ ...prev, license_key: e.target.value }))}
                    placeholder="Mã license key"
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="download_link" className="text-xs">Link tải xuống</Label>
                  <Input
                    id="download_link"
                    value={manualData.download_link}
                    onChange={(e) => setManualData(prev => ({ ...prev, download_link: e.target.value }))}
                    placeholder="https://..."
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="instructions" className="text-xs">Hướng dẫn sử dụng</Label>
                  <Textarea
                    id="instructions"
                    value={manualData.instructions}
                    onChange={(e) => setManualData(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Hướng dẫn chi tiết cho khách hàng..."
                    className="text-sm"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleManualDelivery}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isProcessing ? "Đang gửi..." : "Gửi thông tin"}
                </Button>
                <Button
                  onClick={() => setShowManualForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status indicator */}
        {isDelivered && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Đơn hàng đã được xử lý thành công</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderManagementActions;
