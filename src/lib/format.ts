/** 500000 → "500.000 ₫" (manual grouping so it does not depend on Intl locale data). */
export function formatVND(amount: number): string {
  return `${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ₫`;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

/** ISO string → "03/11/2026 14:05". */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Strips Vietnamese diacritics and lowercases, for accent-insensitive search. */
export function normalizeSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim();
}
