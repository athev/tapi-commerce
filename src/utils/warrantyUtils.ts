import { addDays, addMonths, differenceInDays, isPast, isFuture, format } from 'date-fns';
import { vi } from 'date-fns/locale';

export type WarrantyPeriod = 'none' | 'lifetime' | string; // string for custom like "14_days", "6_months"

/**
 * Parse warranty period string to extract amount and unit
 */
export function parseWarrantyPeriod(period: string | null | undefined): { amount: number; unit: 'days' | 'months' } | null {
  if (!period || period === 'none' || period === 'lifetime') return null;
  
  // Parse formats like "7_days", "1_month", "1_months", "3_months", "14_days"
  const match = period.match(/^(\d+)_(days?|months?)$/);
  if (match) {
    return {
      amount: parseInt(match[1], 10),
      unit: match[2].startsWith('month') ? 'months' : 'days'
    };
  }
  
  return null;
}

/**
 * Get warranty label from period value
 */
export function getWarrantyLabel(period: string | null | undefined): string {
  if (!period || period === 'none') return 'Không bảo hành';
  if (period === 'lifetime') return 'Trọn đời';
  
  const parsed = parseWarrantyPeriod(period);
  if (parsed) {
    const unitText = parsed.unit === 'months' ? 'tháng' : 'ngày';
    return `${parsed.amount} ${unitText}`;
  }
  
  return 'Không bảo hành';
}

/**
 * Get warranty period in a human-readable format
 */
export function getWarrantyPeriodText(period: string | null | undefined): string {
  if (!period || period === 'none') return '';
  if (period === 'lifetime') return 'Trọn đời';
  
  const parsed = parseWarrantyPeriod(period);
  if (parsed) {
    const unitText = parsed.unit === 'months' ? 'tháng' : 'ngày';
    return `${parsed.amount} ${unitText}`;
  }
  
  return '';
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
  
  if (warrantyPeriod === 'lifetime') {
    // Return a very far future date for lifetime warranty
    return addDays(paymentDate, 36500); // ~100 years
  }
  
  const parsed = parseWarrantyPeriod(warrantyPeriod);
  if (parsed) {
    if (parsed.unit === 'months') {
      return addMonths(paymentDate, parsed.amount);
    } else {
      return addDays(paymentDate, parsed.amount);
    }
  }
  
  return null;
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
