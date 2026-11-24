import { describe, expect, it } from "vitest";
import { collectFailedFields } from "../useFormDebug";

describe("collectFailedFields", () => {
  it("returns only paths that carry a message", () => {
    expect(
      collectFailedFields({
        title: { message: "Required", type: "too_small" },
        timeline: { start: { message: "Invalid date" } },
        tags: [{ message: "Too long" }],
      }),
    ).toEqual(["title", "timeline.start", "tags.0"]);
  });

  it("returns nothing for an empty error tree", () => {
    expect(collectFailedFields({})).toEqual([]);
    expect(collectFailedFields(undefined)).toEqual([]);
  });
});
