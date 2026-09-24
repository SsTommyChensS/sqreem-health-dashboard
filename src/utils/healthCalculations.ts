import {
  SLEEP_SCORE_OPTIMAL,
  SLEEP_SCORE_GOOD,
  SLEEP_SCORE_FAIR,
  HR_OPTIMAL_MAX,
  HR_NORMAL_MAX,
  HR_ELEVATED_MAX,
} from '../data/constants';

/**
 * Calculate the arithmetic mean of an array of numbers.
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  return Math.round((sum / numbers.length) * 10) / 10;
}

/**
 * Calculate the percentage change between current and previous value.
 * Positive = increase, Negative = decrease.
 */
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  const diff = current - previous;
  return Math.round((diff / previous) * 100);
}

/**
 * Calculate percentage progress towards a target goal, capped at 100% or uncapped as specified.
 */
export function goalProgressPercent(current: number, target: number, capAt100 = false): number {
  if (target <= 0) return 0;
  const pct = Math.round((current / target) * 100);
  return capAt100 ? Math.min(100, Math.max(0, pct)) : pct;
}

/**
 * Format a number with thousands separators (e.g. 10420 -> "10,420").
 * Caches the Intl.NumberFormat instance at module level for performance.
 */
const numberFormatter = new Intl.NumberFormat('en-US');
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/**
 * Return human-readable label and styling for sleep quality scores (0-100).
 */
export function getSleepQualityDescriptor(score: number): {
  label: string;
  colorClass: string;
  bgClass: string;
} {
  if (score >= SLEEP_SCORE_OPTIMAL) {
    return { label: 'Optimal', colorClass: 'text-emerald-700', bgClass: 'bg-emerald-50' };
  }
  if (score >= SLEEP_SCORE_GOOD) {
    return { label: 'Good', colorClass: 'text-teal-700', bgClass: 'bg-teal-50' };
  }
  if (score >= SLEEP_SCORE_FAIR) {
    return { label: 'Fair', colorClass: 'text-amber-700', bgClass: 'bg-amber-50' };
  }
  return { label: 'Poor', colorClass: 'text-rose-700', bgClass: 'bg-rose-50' };
}

/**
 * Return human-readable label and styling for resting heart rate.
 */
export function getHeartRateDescriptor(bpm: number): {
  label: string;
  colorClass: string;
  bgClass: string;
} {
  if (bpm <= HR_OPTIMAL_MAX) {
    return { label: 'Optimal', colorClass: 'text-emerald-700', bgClass: 'bg-emerald-50' };
  }
  if (bpm <= HR_NORMAL_MAX) {
    return { label: 'Normal', colorClass: 'text-teal-700', bgClass: 'bg-teal-50' };
  }
  if (bpm <= HR_ELEVATED_MAX) {
    return { label: 'Elevated', colorClass: 'text-amber-700', bgClass: 'bg-amber-50' };
  }
  return { label: 'High', colorClass: 'text-rose-700', bgClass: 'bg-rose-50' };
}

/**
 * Format date YYYY-MM-DD to display string like "Wed, Oct 23" or "Oct 23"
 */
export function formatDate(isoDate: string, short = false): string {
  try {
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: short ? undefined : 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
}
