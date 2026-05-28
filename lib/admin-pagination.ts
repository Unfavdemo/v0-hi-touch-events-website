export const ADMIN_PAGE_SIZE = 50

export function parseAdminPage(raw?: string | null): number {
  const n = Number.parseInt(String(raw ?? "1"), 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

export function adminSkip(page: number): number {
  return (page - 1) * ADMIN_PAGE_SIZE
}
