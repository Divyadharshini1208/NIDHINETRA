/**
 * Formatting utilities for numbers, currencies, and dates.
 * Enforces 'en-IN' locale for consistent server-side (SSR) and client-side (CSR)
 * rendering, preventing React hydration mismatches in Next.js.
 */

/**
 * Format numbers in the Indian numbering system (Lakhs & Crores)
 * e.g., 111967 -> "1,11,967"
 */
export function formatNumber(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '0';
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-IN');
}

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(
  val: number | string | null | undefined,
  options?: { showDecimals?: boolean; inCrores?: boolean }
): string {
  if (val === null || val === undefined || val === '') return '₹ 0';
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num)) return '₹ 0';

  if (options?.inCrores) {
    const crVal = num / 10000000;
    return `₹ ${crVal.toFixed(options.showDecimals ? 2 : 1)} Cr`;
  }

  return `₹ ${num.toLocaleString('en-IN', {
    maximumFractionDigits: options?.showDecimals ? 2 : 0,
    minimumFractionDigits: options?.showDecimals ? 2 : 0,
  })}`;
}

/**
 * Deterministic date formatting using en-IN
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN');
  } catch {
    return 'N/A';
  }
}

/**
 * Deterministic date & time formatting using en-IN
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-IN');
  } catch {
    return 'N/A';
  }
}
