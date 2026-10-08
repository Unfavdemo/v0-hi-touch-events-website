/**
 * Gusto payment-visibility service layer.
 *
 * The app consumes the typed GustoClient interface only. The default provider
 * is a deterministic mock; when GUSTO_API_TOKEN is present, a real HTTP client
 * can be dropped in behind the same interface without touching UI code.
 */

export type PayoutState = "PAID" | "PROCESSING" | "SCHEDULED" | "ON_HOLD";

export interface PayoutStatus {
  contractorId: string;
  state: PayoutState;
  lastPaymentDate: string | null;
  lastPaymentAmount: number | null;
  nextPaymentDate: string | null;
  payoutMethod: "DIRECT_DEPOSIT" | "CHECK";
}

export interface Disbursement {
  id: string;
  expectedDate: string;
  amount: number;
  jobTitle: string;
  status: "SCHEDULED" | "PROCESSING";
}

export interface WagePayment {
  id: string;
  paidAt: string;
  grossAmount: number;
  netAmount: number;
  jobTitle: string;
  method: "DIRECT_DEPOSIT" | "CHECK";
}

export interface GustoClient {
  getPayoutStatus(contractorId: string): Promise<PayoutStatus>;
  getUpcomingDisbursements(contractorId: string): Promise<Disbursement[]>;
  getWageHistory(contractorId: string): Promise<WagePayment[]>;
}

/* ------------------------------ Mock provider ----------------------------- */

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

const MOCK_JOBS = [
  "Corporate gala — AV support",
  "Charter event — catering service",
  "Brand activation — photography",
  "Festival stage — DJ set",
  "Venue turnover — waste management",
];

class MockGustoProvider implements GustoClient {
  async getPayoutStatus(contractorId: string): Promise<PayoutStatus> {
    const seed = hashSeed(contractorId);
    const states: PayoutState[] = ["PAID", "PROCESSING", "SCHEDULED"];
    const lastAmount = 180 + (seed % 12) * 45;
    return {
      contractorId,
      state: states[seed % states.length],
      lastPaymentDate: iso(daysFromNow(-((seed % 10) + 3))),
      lastPaymentAmount: lastAmount,
      nextPaymentDate: iso(daysFromNow((seed % 6) + 2)),
      payoutMethod: seed % 5 === 0 ? "CHECK" : "DIRECT_DEPOSIT",
    };
  }

  async getUpcomingDisbursements(contractorId: string): Promise<Disbursement[]> {
    const seed = hashSeed(contractorId);
    const count = (seed % 2) + 1;
    return Array.from({ length: count }, (_, i) => {
      const amount = 220 + ((seed >> (i + 1)) % 10) * 60;
      return {
        id: `disb_${contractorId.slice(0, 6)}_${i}`,
        expectedDate: iso(daysFromNow((seed % 5) + 3 + i * 7)),
        amount,
        jobTitle: MOCK_JOBS[(seed + i) % MOCK_JOBS.length],
        status: i === 0 ? ("PROCESSING" as const) : ("SCHEDULED" as const),
      };
    });
  }

  async getWageHistory(contractorId: string): Promise<WagePayment[]> {
    const seed = hashSeed(contractorId);
    const count = (seed % 3) + 3;
    return Array.from({ length: count }, (_, i) => {
      const gross = 200 + ((seed >> (i + 2)) % 14) * 50;
      return {
        id: `pay_${contractorId.slice(0, 6)}_${i}`,
        paidAt: iso(daysFromNow(-(i * 14 + (seed % 7) + 4))),
        grossAmount: gross,
        netAmount: Math.round(gross * 0.93 * 100) / 100,
        jobTitle: MOCK_JOBS[(seed + i * 2) % MOCK_JOBS.length],
        method: (seed + i) % 5 === 0 ? "CHECK" : "DIRECT_DEPOSIT",
      };
    });
  }
}

let clientSingleton: GustoClient | undefined;

export function getGustoClient(): GustoClient {
  if (clientSingleton) return clientSingleton;
  // A real provider keyed off GUSTO_API_TOKEN slots in here later; the mock
  // keeps dashboards fully functional in the meantime.
  clientSingleton = new MockGustoProvider();
  return clientSingleton;
}
