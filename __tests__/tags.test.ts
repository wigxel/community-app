import {
  hasTag,
  MAX_PROJECT_TAGS,
  MAX_TAG_LENGTH,
  normalizeTag,
  normalizeTags,
} from "~/lib/tags";

describe("tag helpers", () => {
  it("exposes the shared limits", () => {
    expect(MAX_PROJECT_TAGS).toBe(8);
    expect(MAX_TAG_LENGTH).toBe(32);
  });

  it("trims and collapses whitespace", () => {
    expect(normalizeTag("  ui   design ")).toBe("ui design");
  });

  it("drops blanks and case-insensitive duplicates while preserving order", () => {
    expect(normalizeTags([" React ", "react", "", "   ", "CSS"])).toEqual([
      "React",
      "CSS",
    ]);
  });

  it("matches membership case-insensitively", () => {
    expect(hasTag(["React"], "react")).toBe(true);
    expect(hasTag(["React"], "Vue")).toBe(false);
  });
});
