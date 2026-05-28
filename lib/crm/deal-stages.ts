export type DealStageName =
  | "LEAD"
  | "QUALIFIED"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "CLOSED_WON"
  | "CLOSED_LOST"

export const DEAL_STAGES: DealStageName[] = [
  "LEAD",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
]

export const DEAL_STAGE_LABELS: Record<DealStageName, string> = {
  LEAD: "Lead",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal sent",
  NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed won",
  CLOSED_LOST: "Closed lost",
}

export const OPEN_DEAL_STAGES: DealStageName[] = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION"]

export function formatDealAmount(amount: { toString(): string } | null | undefined, currency = "USD"): string {
  if (amount == null) return "—"
  const n = Number(amount.toString())
  if (!Number.isFinite(n)) return "—"
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n)
}
