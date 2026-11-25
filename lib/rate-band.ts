/**
 * Affordability band for talent profiles.
 *
 * Public profiles only ever show the band (₦ / ₦₦ / ₦₦₦ / ₦₦₦₦);
 * the exact rate is owner-private.
 */

import { v } from "convex/values";

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

/** How a user prices their work; bands are computed on a monthly scale. */
export type RateUnit = "hour" | "day" | "week" | "month" | "project";

/** Convex validator for RateUnit, shared by schema and mutations. */
export const RATE_UNIT_SCHEMA = v.union(
  v.literal("hour"),
  v.literal("day"),
  v.literal("week"),
  v.literal("month"),
  v.literal("project"),
);

/** Working-time assumptions that normalise any unit to a monthly figure. */
const UNIT_MONTHLY_FACTOR = {
  hour: 160, // 20 working days × 8 hours
  day: 20,
  week: 4.3,
  month: 1,
} as const satisfies Record<Exclude<RateUnit, "project">, number>;

/**
 * Converts a rate to its monthly equivalent so bands are comparable across
 * units. A project price is spread over its duration at 20 working days/month.
 */
export function monthlyEquivalent(
  unit: RateUnit,
  amount: number,
  projectDays?: number,
): number {
  if (unit === "project") {
    if (!Number.isFinite(amount)) return 0;
    if (!projectDays || projectDays <= 0) return amount;
    return (amount / projectDays) * 20;
  }
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return amount * UNIT_MONTHLY_FACTOR[unit];
}

/**
 * A confirmed rate is frozen for 6 months (~180 days).
 * ponytail: flat 180d, not calendar months — good enough for a lock
 */
export const RATE_LOCK_MS = 180 * 24 * 60 * 60 * 1000;

export function rateUnlocksAt(confirmedAt: number): number {
  return confirmedAt + RATE_LOCK_MS;
}

/** "26 May 2027" — UTC, so a lock date can be off by a day at most. */
export function formatDate(ms: number): string {
  const d = new Date(ms);
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
