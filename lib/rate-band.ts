/**
 * Affordability band for talent profiles.
 *
 * Public profiles only ever show the band (₦ / ₦₦ / ₦₦₦ / ₦₦₦₦);
 * the exact rate is owner-private.
 */

export type RateBand = "₦" | "₦₦" | "₦₦₦" | "₦₦₦₦";

/** Upper bounds (exclusive) of bands 1–3; anything above the last is ₦₦₦₦. */
export const RATE_BAND_THRESHOLDS = [50_000, 200_000, 500_000] as const;

export function rateBand(amount: number): RateBand {
  if (!Number.isFinite(amount) || amount < 0) return "₦";
  if (amount < RATE_BAND_THRESHOLDS[0]) return "₦";
  if (amount < RATE_BAND_THRESHOLDS[1]) return "₦₦";
  if (amount < RATE_BAND_THRESHOLDS[2]) return "₦₦₦";
  return "₦₦₦₦";
}
