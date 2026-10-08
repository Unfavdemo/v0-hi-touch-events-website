export interface CalendarDay {
  date: Date;
  iso: string;
  inMonth: boolean;
  isToday: boolean;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function toYearMonth(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function parseYearMonth(raw: string | string[] | undefined): { year: number; month: number } {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const now = new Date();
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return { year: now.getFullYear(), month: now.getMonth() };
  }
  const [year, month] = value.split("-").map(Number);
  if (month < 1 || month > 12) {
    return { year: now.getFullYear(), month: now.getMonth() };
  }
  return { year, month: month - 1 };
}

export function shiftYearMonth(year: number, month: number, delta: number): string {
  const d = new Date(year, month + delta, 1);
  return toYearMonth(d);
}

export function monthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(year, month, 1),
  );
}

export function isoDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Sunday-start grid covering the visible month. */
export function monthGrid(year: number, month: number): CalendarDay[] {
  const todayIso = isoDay(new Date());
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const iso = isoDay(date);
    days.push({
      date,
      iso,
      inMonth: date.getMonth() === month,
      isToday: iso === todayIso,
    });
  }
  while (days.length > 35 && days.slice(-7).every((d) => !d.inMonth)) {
    days.splice(-7);
  }
  return days;
}

/** Local calendar days from start through end, inclusive. */
export function daysSpanned(start: Date, end: Date): string[] {
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const out: string[] = [];
  while (cursor <= last) {
    out.push(isoDay(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out.length > 0 ? out : [isoDay(start)];
}
