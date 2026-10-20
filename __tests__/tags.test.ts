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

  it("normalises tags to lowercase hashtags", () => {
    expect(normalizeTag("  UI   Design ")).toBe("ui_design");
    expect(normalizeTag("#React")).toBe("react");
    expect(normalizeTag("UI/UX")).toBe("ui_ux");
    expect(normalizeTag("Node.js 20")).toBe("node_js_20");
    expect(normalizeTag("R&D")).toBe("r_d");
    expect(normalizeTag("C++")).toBe("c");
    expect(normalizeTag("###")).toBe("");
  });

  it("drops blanks and duplicates while preserving order", () => {
    expect(normalizeTags([" React ", "react", "", "   ", "CSS"])).toEqual([
      "react",
      "css",
    ]);
  });

  it("matches membership case-insensitively", () => {
    expect(hasTag(["React"], "react")).toBe(true);
    expect(hasTag(["React"], "Vue")).toBe(false);
  });
});
