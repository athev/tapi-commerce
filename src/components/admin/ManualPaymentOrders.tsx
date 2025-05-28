
import { useManualPaymentOrders } from "./hooks/useManualPaymentOrders";
import ManualPaymentOrderCard from "./components/ManualPaymentOrderCard";

const ManualPaymentOrders = () => {
  const {
    manualOrders,
    isLoading,
    isProcessing,
    handleConfirmPayment,
    handleRejectPayment
  } = useManualPaymentOrders();

  if (isLoading) {
    return <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-primary"></div>
    </div>;
  }

  if (!manualOrders || manualOrders.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Không có đơn hàng cần xác nhận thủ công</h3>
        <p className="text-gray-500">Tất cả đơn hàng đã được xử lý tự động</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Đơn hàng chờ xác nhận thủ công ({manualOrders.length})</h3>
      
      {manualOrders.map((order) => (
        <ManualPaymentOrderCard
          key={order.id}
          order={order}
          isProcessing={isProcessing === order.id}
          onConfirm={handleConfirmPayment}
          onReject={handleRejectPayment}
        />
      ))}
    </div>
  );
};

export default ManualPaymentOrders;
