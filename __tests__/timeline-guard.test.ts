import { describe, expect, it } from "vitest";
import { isStartAfterEnd, timelineToTimestamp } from "../convex/project";

describe("isStartAfterEnd (timestamps)", () => {
  it("returns Right(false) when start < end", () => {
    const r = isStartAfterEnd(100, 200);
    expect(r._tag).toBe("Right");
    if (r._tag === "Right") expect(r.right).toBe(false);
  });

  it("returns Right(false) when start === end", () => {
    const r = isStartAfterEnd(100, 100);
    expect(r._tag).toBe("Right");
    if (r._tag === "Right") expect(r.right).toBe(false);
  });

  it("returns Right(true) when start > end", () => {
    const r = isStartAfterEnd(200, 100);
    expect(r._tag).toBe("Right");
    if (r._tag === "Right") expect(r.right).toBe(true);
  });

  it("returns Left when start is not a number", () => {
    // @ts-expect-error testing invalid input
    const r = isStartAfterEnd("foo", 100);
    expect(r._tag).toBe("Left");
  });

  it("returns Left when end is not a number", () => {
    // @ts-expect-error testing invalid input
    const r = isStartAfterEnd(100, null);
    expect(r._tag).toBe("Left");
  });

  it("returns Left when start is NaN", () => {
    const r = isStartAfterEnd(NaN, 100);
    expect(r._tag).toBe("Left");
  });

  it("returns Left when end is negative", () => {
    const r = isStartAfterEnd(100, -1);
    expect(r._tag).toBe("Left");
  });
});

describe("timelineToTimestamp", () => {
  it("returns Right with unix timestamp for valid input", () => {
    const r = timelineToTimestamp({ year: "2024", month: "January" });
    expect(r._tag).toBe("Right");
    if (r._tag === "Right")
      expect(r.right).toBe(new Date(2024, 0).getTime() / 1000);
  });

  it("converts { year } (no month) to january 1st", () => {
    const r = timelineToTimestamp({ year: "2024" });
    expect(r._tag).toBe("Right");
    if (r._tag === "Right")
      expect(r.right).toBe(new Date(2024, 0).getTime() / 1000);
  });

  it("converts December correctly", () => {
    const r = timelineToTimestamp({ year: "2024", month: "December" });
    expect(r._tag).toBe("Right");
    if (r._tag === "Right")
      expect(r.right).toBe(new Date(2024, 11).getTime() / 1000);
  });

  it("returns Left for null", () => {
    const r = timelineToTimestamp(null);
    expect(r._tag).toBe("Left");
  });

  it("returns Left for invalid year", () => {
    const r = timelineToTimestamp({ year: "abc" });
    expect(r._tag).toBe("Left");
  });

  it("returns Left for invalid month", () => {
    const r = timelineToTimestamp({ year: "2024", month: "bogus" });
    expect(r._tag).toBe("Left");
  });
});
