export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0 
  }).format(price);
};

export const formatSoldCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}tr`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};

export const calculateDiscount = (original: number, current: number): number => {
  if (original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
};
