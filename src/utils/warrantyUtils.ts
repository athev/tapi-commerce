import { addDays, addMonths, differenceInDays, isPast, isFuture, format } from 'date-fns';
import { vi } from 'date-fns/locale';

export type WarrantyPeriod = 'none' | '7_days' | '1_month' | '3_months' | 'lifetime';

export const WARRANTY_OPTIONS = [
  { value: 'none', label: '❌ Không bảo hành', description: 'Sản phẩm không có bảo hành' },
  { value: '7_days', label: '🛡️ 7 ngày', description: 'Bảo hành 7 ngày kể từ ngày thanh toán' },
  { value: '1_month', label: '🛡️ 1 tháng', description: 'Bảo hành 1 tháng kể từ ngày thanh toán' },
  { value: '3_months', label: '🛡️ 3 tháng', description: 'Bảo hành 3 tháng kể từ ngày thanh toán' },
  { value: 'lifetime', label: '♾️ Trọn đời', description: 'Bảo hành không giới hạn thời gian' },
] as const;

/**
 * Get warranty label from period value
 */
export function getWarrantyLabel(period: string | null | undefined): string {
  if (!period || period === 'none') return 'Không bảo hành';
  
  const option = WARRANTY_OPTIONS.find(opt => opt.value === period);
  if (option) {
    // Remove emoji prefix for cleaner display
    return option.label.replace(/^[^\s]+\s/, '');
  }
  
  return 'Không bảo hành';
}

/**
 * Get warranty period in a human-readable format
 */
export function getWarrantyPeriodText(period: string | null | undefined): string {
  switch (period) {
    case '7_days': return '7 ngày';
    case '1_month': return '1 tháng';
    case '3_months': return '3 tháng';
    case 'lifetime': return 'Trọn đời';
    default: return '';
  }
}

/**
 * Calculate warranty expiry date from payment date
 */
export function calculateWarrantyExpiry(
  paidAt: string | Date,
  warrantyPeriod: string | null | undefined
): Date | null {
  if (!warrantyPeriod || warrantyPeriod === 'none') return null;
  
  const paymentDate = new Date(paidAt);
  
  switch (warrantyPeriod) {
    case '7_days':
      return addDays(paymentDate, 7);
    case '1_month':
      return addMonths(paymentDate, 1);
    case '3_months':
      return addMonths(paymentDate, 3);
    case 'lifetime':
      // Return a very far future date for lifetime warranty
      return addDays(paymentDate, 36500); // ~100 years
    default:
      return null;
  }
}

/**
 * Check if order is still under warranty
 */
export function isUnderWarranty(
  paidAt: string | Date,
  warrantyPeriod: string | null | undefined
): boolean {
  if (!warrantyPeriod || warrantyPeriod === 'none') return false;
  if (warrantyPeriod === 'lifetime') return true;
  
  const expiryDate = calculateWarrantyExpiry(paidAt, warrantyPeriod);
  if (!expiryDate) return false;
  
  return isFuture(expiryDate);
}

/**
 * Get remaining warranty days
 * Returns -1 for lifetime warranty
 * Returns 0 if warranty expired
 */
export function getRemainingWarrantyDays(
  paidAt: string | Date,
  warrantyPeriod: string | null | undefined
): number {
  if (!warrantyPeriod || warrantyPeriod === 'none') return 0;
  if (warrantyPeriod === 'lifetime') return -1; // Special value for lifetime
  
  const expiryDate = calculateWarrantyExpiry(paidAt, warrantyPeriod);
  if (!expiryDate) return 0;
  
  const today = new Date();
  const daysRemaining = differenceInDays(expiryDate, today);
  
  return Math.max(0, daysRemaining);
}

/**
 * Get warranty status info for display
 */
export interface WarrantyStatus {
  hasWarranty: boolean;
  isActive: boolean;
  isLifetime: boolean;
  remainingDays: number;
  expiryDate: Date | null;
  statusText: string;
  statusColor: 'green' | 'yellow' | 'red' | 'gray';
}

export function getWarrantyStatus(
  paidAt: string | Date | null | undefined,
  warrantyPeriod: string | null | undefined
): WarrantyStatus {
  const defaultStatus: WarrantyStatus = {
    hasWarranty: false,
    isActive: false,
    isLifetime: false,
    remainingDays: 0,
    expiryDate: null,
    statusText: 'Không bảo hành',
    statusColor: 'gray',
  };
  
  if (!paidAt || !warrantyPeriod || warrantyPeriod === 'none') {
    return defaultStatus;
  }
  
  const isLifetime = warrantyPeriod === 'lifetime';
  const expiryDate = calculateWarrantyExpiry(paidAt, warrantyPeriod);
  const remainingDays = getRemainingWarrantyDays(paidAt, warrantyPeriod);
  const isActive = isUnderWarranty(paidAt, warrantyPeriod);
  
  let statusText = '';
  let statusColor: WarrantyStatus['statusColor'] = 'gray';
  
  if (isLifetime) {
    statusText = 'Bảo hành trọn đời';
    statusColor = 'green';
  } else if (isActive) {
    if (remainingDays <= 3) {
      statusText = `Sắp hết hạn (còn ${remainingDays} ngày)`;
      statusColor = 'yellow';
    } else {
      statusText = `Còn ${remainingDays} ngày bảo hành`;
      statusColor = 'green';
    }
  } else {
    statusText = expiryDate 
      ? `Hết bảo hành từ ${format(expiryDate, 'dd/MM/yyyy', { locale: vi })}`
      : 'Hết bảo hành';
    statusColor = 'red';
  }
  
  return {
    hasWarranty: true,
    isActive,
    isLifetime,
    remainingDays,
    expiryDate,
    statusText,
    statusColor,
  };
}

/**
 * Format warranty expiry for display
 */
export function formatWarrantyExpiry(expiryDate: Date | null): string {
  if (!expiryDate) return '';
  return format(expiryDate, 'dd/MM/yyyy', { locale: vi });
}

/**
 * Check if warranty claim is within 24h deadline
 */
export function isWithinDeadline(deadlineAt: string | Date): boolean {
  return isFuture(new Date(deadlineAt));
}

/**
 * Get remaining hours until deadline
 */
export function getRemainingDeadlineHours(deadlineAt: string | Date): number {
  const now = new Date();
  const deadline = new Date(deadlineAt);
  const diffMs = deadline.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
}
