import { format } from 'date-fns';

export function formatDate(dateString: string, formatStr = 'MMM d, yyyy') {
  try {
    return format(new Date(dateString), formatStr);
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateString: string) {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  } catch (e) {
    return dateString;
  }
}

export function formatCurrency(amount: number, currency = 'USD') {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}
