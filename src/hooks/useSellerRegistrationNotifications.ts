
import { toast } from 'sonner';

export const useSellerRegistrationNotifications = () => {
  const showSuccessNotification = () => {
    toast.success('🎉 Đăng ký người bán thành công!', {
      description: 'Bạn đã có thể tạo và bán sản phẩm',
      duration: 3000,
    });
  };

  const showErrorNotification = (error: any) => {
    console.error('Error registering as seller:', error);
    
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      toast.error('Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.');
    } else {
      toast.error('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.');
    }
  };

  const showAuthErrorNotification = () => {
    toast.error('Bạn cần đăng nhập để đăng ký làm người bán');
  };

  return {
    showSuccessNotification,
    showErrorNotification,
    showAuthErrorNotification
  };
};
