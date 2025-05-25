
interface OrdersErrorStateProps {
  error: Error | unknown;
}

const OrdersErrorState = ({ error }: OrdersErrorStateProps) => (
  <div className="text-center py-12 bg-red-50 rounded-lg">
    <h3 className="text-lg font-medium mb-2 text-red-800">Có lỗi xảy ra</h3>
    <p className="text-red-600">
      {error instanceof Error ? error.message : 'Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.'}
    </p>
  </div>
);

export default OrdersErrorState;
