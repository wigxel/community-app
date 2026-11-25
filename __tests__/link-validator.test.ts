import { describe, expect, it } from "vitest";
import { projectLinkSchema } from "~/lib/validators/schema";

describe("projectLinkSchema", () => {
  it("accepts GitHub with valid path", () => {
    const result = projectLinkSchema.safeParse({
      tag: "github",
      value: "user/repo",
    });
    expect(result.success).toBe(true);
  });

  it("rejects GitHub with empty string", () => {
    const result = projectLinkSchema.safeParse({
      tag: "github",
      value: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts Figma with valid ID", () => {
    const result = projectLinkSchema.safeParse({
      tag: "figma",
      value: "file/abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects Figma with empty string", () => {
    const result = projectLinkSchema.safeParse({
      tag: "figma",
      value: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts Behance with valid path", () => {
    const result = projectLinkSchema.safeParse({
      tag: "behance",
      value: "gallery/12345",
    });
    expect(result.success).toBe(true);
  });

  it("rejects Behance with empty string", () => {
    const result = projectLinkSchema.safeParse({
      tag: "behance",
      value: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts other with a bare host and path", () => {
    const result = projectLinkSchema.safeParse({
      tag: "other",
      value: "example.com/page",
    });
    expect(result.success).toBe(true);
  });

  it("rejects other that already includes the scheme", () => {
    const result = projectLinkSchema.safeParse({
      tag: "other",
      value: "https://example.com/page",
    });
    expect(result.success).toBe(false);
  });

  it("rejects other with plain text", () => {
    const result = projectLinkSchema.safeParse({
      tag: "other",
      value: "hello world",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid tag", () => {
    const result = projectLinkSchema.safeParse({
      tag: "twitter",
      value: "user",
    });
    expect(result.success).toBe(false);
  });
});
