/** Formatting utilities for currency, numbers, and percentages */

export function formatCurrency(value, compact = false) {
  if (value == null) return '—';
  if (compact && Math.abs(value) >= 1_000_000) {
    return '$' + (value / 1_000_000).toFixed(2) + 'M';
  }
  if (compact && Math.abs(value) >= 1_000) {
    return '$' + (value / 1_000).toFixed(1) + 'K';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

export function formatPercent(value, decimals = 1) {
  if (value == null) return '—';
  return value.toFixed(decimals) + '%';
}

export function formatCompact(value) {
  if (value == null) return '—';
  if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(value) >= 1_000) return (value / 1_000).toFixed(1) + 'K';
  return value.toFixed(0);
}
