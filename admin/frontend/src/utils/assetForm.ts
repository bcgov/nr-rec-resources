import { formatDateISO } from '@shared/utils';

export function toDateInputValue(
  date: Date | string | number | null | undefined,
): string {
  return formatDateISO(date) ?? '';
}

export function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const n = Number.parseFloat(trimmed);
  return Number.isNaN(n) ? null : n;
}
