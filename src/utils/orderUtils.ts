
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(price);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const getProductTypeLabel = (type: string) => {
  const types = {
    file_download: 'Tải xuống file',
    license_key_delivery: 'Gửi License Key',
    shared_account: 'Tài khoản dùng chung',
    upgrade_account_no_pass: 'Nâng cấp tài khoản',
    upgrade_account_with_pass: 'Nâng cấp tài khoản (có pass)'
  };
  return types[type as keyof typeof types] || type;
};
