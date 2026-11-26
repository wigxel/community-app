import { describe, expect, it } from "vitest";
import {
  MAX_SLUG_KEBAB,
  projectSlug,
  projectIdSuffix,
  slugifyTitle,
} from "~/lib/slug";

describe("slugifyTitle", () => {
  it("kebab-cases titles", () => {
    expect(slugifyTitle("My Cool App")).toBe("my-cool-app");
    expect(slugifyTitle("  Hello   World  ")).toBe("hello-world");
    expect(slugifyTitle("R&D Tool (v2)")).toBe("r-d-tool-v2");
  });

  it("falls back to 'project' for empty or all-non-Latin titles", () => {
    expect(slugifyTitle("")).toBe("project");
    expect(slugifyTitle("   ")).toBe("project");
    expect(slugifyTitle("你好世界")).toBe("project");
  });

  it("caps the kebab portion at 80 chars", () => {
    expect(slugifyTitle("a".repeat(200)).length).toBe(MAX_SLUG_KEBAB);
    // Trailing hyphen created by the cap is trimmed.
    const edge = slugifyTitle(`a-${"b".repeat(90)}`);
    expect(edge.length).toBeLessThanOrEqual(MAX_SLUG_KEBAB);
    expect(edge.endsWith("-")).toBe(false);
  });
});

describe("projectIdSuffix", () => {
  it("is exactly 6 chars of [a-z0-9]", () => {
    const suffix = projectIdSuffix("jx71cyx6wbzzkw305awtxcc04h8gk1jn");
    expect(suffix).toMatch(/^[a-z0-9]{6}$/);
  });

  it("is deterministic per doc id", () => {
    expect(projectIdSuffix("jx71cyx6wbzzkw305awtxcc04h8gk1jn")).toBe(
      projectIdSuffix("jx71cyx6wbzzkw305awtxcc04h8gk1jn"),
    );
    expect(projectIdSuffix("jx726ky5pqj784n6c1frshbafs8gjcth")).not.toBe(
      projectIdSuffix("jx71cyx6wbzzkw305awtxcc04h8gk1jn"),
    );
  });
});

describe("projectSlug", () => {
  const id = "jx71cyx6wbzzkw305awtxcc04h8gk1jn";

  it("joins kebab title and 6-char suffix", () => {
    expect(projectSlug(id, "My Cool App")).toMatch(/^my-cool-app-[a-z0-9]{6}$/);
    expect(projectSlug(id, "")).toMatch(/^project-[a-z0-9]{6}$/);
  });

  it("keeps the suffix when the title changes (rename)", () => {
    const before = projectSlug(id, "Old Name");
    const after = projectSlug(id, "Brand New Name");
    expect(before.slice(-6)).toBe(after.slice(-6));
    expect(before).not.toBe(after);
  });
});
