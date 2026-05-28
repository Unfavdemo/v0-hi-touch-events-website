/** Format a Date for `<input type="datetime-local" />` in local time. */
export function toDatetimeLocalValue(d: Date | null | undefined): string {
  if (!d || Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
