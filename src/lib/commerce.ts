export type ProPlan = "MONTH" | "YEAR";

export const FREE_PACKS = ["ua"] as const;

/** UAH prices for Kadr Pro (display + checkout). */
export const PRO_PRICES_UAH: Record<ProPlan, number> = {
  MONTH: 149,
  YEAR: 999,
};

export const PRO_LABELS: Record<ProPlan, string> = {
  MONTH: "Місяць",
  YEAR: "Рік",
};

/** Duration added on successful payment. */
export const PRO_DURATION_MS: Record<ProPlan, number> = {
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
};

export function isFreePack(packId: string): boolean {
  return (FREE_PACKS as readonly string[]).includes(packId);
}

export function packRequiresPro(packId: string): boolean {
  return !isFreePack(packId);
}

export function uahToKop(uah: number): number {
  return Math.round(uah * 100);
}

export function formatUah(uah: number): string {
  return `${uah}\u00a0₴`;
}

export function isProActive(expiresAt: Date | string | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() > Date.now();
}
