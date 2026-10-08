import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatMoney(value: number | string): string {
  return usd.format(typeof value === "string" ? Number(value) : value);
}

const DISPLAY_TZ = "America/New_York";

const dateTimeFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: DISPLAY_TZ,
});

const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: DISPLAY_TZ,
});

export function formatDateTime(date: Date): string {
  return dateTimeFmt.format(date);
}

function calendarDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DISPLAY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatTimeRange(start: Date, end: Date): string {
  const sameDay = calendarDay(start) === calendarDay(end);
  if (sameDay) {
    return `${dateTimeFmt.format(start)} – ${timeFmt.format(end)}`;
  }
  return `${dateTimeFmt.format(start)} – ${dateTimeFmt.format(end)}`;
}

const dayFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: DISPLAY_TZ,
});

export function formatDay(date: Date): string {
  return dayFmt.format(date);
}

/** Time only, with the day appended when it falls on a different day than `reference`. */
export function formatTimeOn(date: Date, reference: Date): string {
  const time = timeFmt.format(date);
  return calendarDay(date) === calendarDay(reference)
    ? time
    : `${time} · ${dayFmt.format(date)}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: DISPLAY_TZ,
  }).format(date);
}

/** Value for `<input type="datetime-local" />` in local timezone. */
export function toDatetimeLocalValue(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
