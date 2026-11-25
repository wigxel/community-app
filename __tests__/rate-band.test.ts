import { describe, expect, it } from "vitest";
import {
  formatDate,
  monthlyEquivalent,
  RATE_LOCK_MS,
  rateUnlocksAt,
} from "../lib/rate-band";

describe("monthlyEquivalent", () => {
  it("normalises every unit to a monthly figure", () => {
    expect(monthlyEquivalent("hour", 500)).toBe(80_000);
    expect(monthlyEquivalent("day", 10_000)).toBe(200_000);
    expect(monthlyEquivalent("week", 50_000)).toBeCloseTo(215_000);
    expect(monthlyEquivalent("month", 150_000)).toBe(150_000);
  });

  it("spreads a project price over its duration", () => {
    expect(monthlyEquivalent("project", 300_000, 10)).toBe(600_000);
    expect(monthlyEquivalent("project", 300_000, 60)).toBe(100_000);
  });

  it("treats a project without duration as one monthly engagement", () => {
    expect(monthlyEquivalent("project", 300_000)).toBe(300_000);
  });

  it("returns 0 for non-finite or negative amounts", () => {
    expect(monthlyEquivalent("day", Number.NaN)).toBe(0);
    expect(monthlyEquivalent("day", -5)).toBe(0);
    expect(monthlyEquivalent("project", Number.NaN)).toBe(0);
  });
});

describe("rate lock", () => {
  it("unlocks exactly RATE_LOCK_MS after confirmation", () => {
    const confirmedAt = 1_700_000_000_000;
    expect(rateUnlocksAt(confirmedAt)).toBe(confirmedAt + RATE_LOCK_MS);
  });

  it("formats the unlock date", () => {
    // 2026-11-25T00:00:00Z + 180 days = 2027-05-24
    const confirmedAt = Date.UTC(2026, 10, 25);
    expect(formatDate(rateUnlocksAt(confirmedAt))).toBe("24 May 2027");
  });
});
