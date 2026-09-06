import { projectSchema } from "~/lib/validators/schema";

const thisYear = new Date().getFullYear();
const minYear = thisYear - 19;

const base = {
  userId: "user_123",
  title: "Valid Title",
  description: "",
  timeline: { start: null as unknown as null, end: null as unknown as null },
  ongoing: false,
  media: [],
  link: [],
} as const;

function parse(data: unknown) {
  return projectSchema.safeParse(data);
}

describe("projectSchema", () => {
  it("passes valid happy path", () => {
    const res = parse({
      ...base,
      timeline: { start: { year: String(thisYear - 1) }, end: null },
    });
    expect(res.success).toBe(true);
  });

  it("fails whitespace title", () => {
    const res = parse({ ...base, title: "   " });
    expect(res.success).toBe(false);
    if (!res.success)
      expect(res.error.issues[0].message).toMatch(/Title is required/);
  });

  it("fails title >100", () => {
    const res = parse({ ...base, title: "a".repeat(101) });
    expect(res.success).toBe(false);
    if (!res.success)
      expect(res.error.issues.some((i) => i.message.includes("100"))).toBe(
        true,
      );
  });

  it("fails description >300", () => {
    const res = parse({ ...base, description: "a".repeat(301) });
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error.issues[0].message).toMatch(/300/);
  });

  it("fails year out of range low", () => {
    const res = parse({
      ...base,
      timeline: { start: { year: String(minYear - 1) }, end: null },
    });
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error.issues[0].message).toMatch(/between/);
  });

  it("fails year out of range high", () => {
    const res = parse({
      ...base,
      timeline: { start: { year: String(thisYear + 1) }, end: null },
    });
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error.issues[0].message).toMatch(/between/);
  });

  it("fails invalid month", () => {
    const res = parse({
      ...base,
      timeline: {
        start: { month: "Foo", year: String(thisYear) } as unknown as {
          month: string;
          year: string;
        },
        end: null,
      },
    });
    expect(res.success).toBe(false);
    if (!res.success)
      expect(res.error.issues[0].message).toMatch(/Invalid month/);
  });

  it("fails ongoing true with end non-null", () => {
    const res = parse({
      ...base,
      ongoing: true,
      timeline: {
        start: { year: String(thisYear - 1) },
        end: { year: String(thisYear) },
      },
    });
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error.issues[0].message).toMatch(/ongoing/);
  });

  it("fails end before start", () => {
    const res = parse({
      ...base,
      timeline: {
        start: { year: String(thisYear) },
        end: { year: String(thisYear - 1) },
      },
    });
    expect(res.success).toBe(false);
    if (!res.success)
      expect(res.error.issues[0].message).toMatch(/before start/);
  });

  it("passes end equal start", () => {
    const y = String(thisYear - 1);
    const res = parse({
      ...base,
      timeline: {
        start: { year: y, month: "January" } as unknown as {
          month: string;
          year: string;
        },
        end: { year: y, month: "January" } as unknown as {
          month: string;
          year: string;
        },
      },
    });
    expect(res.success).toBe(true);
  });

  it("passes both null timeline", () => {
    const res = parse({ ...base, timeline: { start: null, end: null } });
    expect(res.success).toBe(true);
  });
});
