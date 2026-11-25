import { describe, expect, it } from "vitest";
import { rateBand } from "./rate-band";

describe("rateBand", () => {
  it("maps amounts to the four Naira bands", () => {
    expect(rateBand(0)).toBe("₦");
    expect(rateBand(49_999)).toBe("₦");
    expect(rateBand(50_000)).toBe("₦₦");
    expect(rateBand(199_999)).toBe("₦₦");
    expect(rateBand(200_000)).toBe("₦₦₦");
    expect(rateBand(499_999)).toBe("₦₦₦");
    expect(rateBand(500_000)).toBe("₦₦₦₦");
  });

  it("treats invalid amounts as the cheapest band", () => {
    expect(rateBand(-5)).toBe("₦");
    expect(rateBand(Number.NaN)).toBe("₦");
  });
});
