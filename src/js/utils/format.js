// ===== Format Utilities =====
import { t } from './i18n.js';

/** 格式化金额为 $xxx,xxx */
export function formatMoney(amount) {
  const abs = Math.abs(Math.round(amount));
  const formatted = abs.toLocaleString('en-US');
  return (amount < 0 ? '-' : '') + '$' + formatted;
}

/** 格式化百分比 */
export function formatPercent(value, decimals = 0) {
  return (value * 100).toFixed(decimals) + '%';
}

/** 格式化月份显示 */
export function formatMonth(month, year) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[month - 1]} Year ${year}`;
}

/** 格式化月份双语 */
export function formatMonthCN(month, year) {
  return t('format.yearMonth', { year, month });
}

/** 格式化进度百分比 */
export function formatProgress(current, total) {
  if (total <= 0) return '0%';
  const pct = Math.min(100, (current / total) * 100);
  return Math.round(pct) + '%';
}

/** 格式化数字简写 */
export function formatShort(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return String(num);
}
