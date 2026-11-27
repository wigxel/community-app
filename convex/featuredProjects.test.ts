/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

const FAKE_USER = { _id: "user_test_123", email: "test@example.com" };
const DAY_MS = 24 * 60 * 60 * 1000;

vi.mock("./auth", () => ({
  authComponent: {
    getAuthUser: vi.fn(),
  },
}));

import { authComponent } from "./auth";
const mockGetAuthUser = vi.mocked(
  authComponent.getAuthUser,
) as unknown as ReturnType<typeof vi.fn>;

describe("featured projects snapshot", () => {
  // Keeps the schema generic so index names inside t.run type-check.
  const makeTest = () => convexTest(schema, modules);
  let t: ReturnType<typeof makeTest>;
  let now: number;

  beforeEach(() => {
    vi.useFakeTimers();
    now = new Date("2026-06-01T00:00:00Z").getTime();
    vi.setSystemTime(now);
    t = makeTest();
    mockGetAuthUser.mockResolvedValue(FAKE_USER as any);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const insertProject = (title: string) =>
    t.run((ctx) =>
      ctx.db.insert("project", {
        userId: FAKE_USER._id,
        title,
        description: `${title} description`,
        timeline: { start: { year: "2024" }, end: null },
        ongoing: true,
        media: [],
        link: [],
        tags: [],
      }),
    );

  const favourite = (projectId: Id<"project">, count = 1) =>
    t.run(async (ctx) => {
      for (let i = 0; i < count; i++) {
        await ctx.db.insert("projectFavourites", {
          userId: `user_${i}`,
          projectId,
        });
      }
      await ctx.db.patch(projectId, { favouriteCount: count });
    });

  const featuredTitles = async () =>
    (await t.query(api.project.listFeatured, {})).map((p) => p.title);

  it("falls back to the latest projects before the first recompute", async () => {
    await insertProject("Old");
    vi.setSystemTime(now + 1000);
    await insertProject("New");

    expect(await featuredTitles()).toEqual(["New", "Old"]);
  });

  it("ranks the recent window first, then older windows, then pads with latest", async () => {
    // Created and favourited 45 days ago → lands in the second window.
    vi.setSystemTime(now - 45 * DAY_MS);
    const older = await insertProject("Older favourite");
    await favourite(older, 5);

    vi.setSystemTime(now - 10 * DAY_MS);
    const recent = await insertProject("Recent favourite");
    await favourite(recent, 2);
    await insertProject("No favourites");

    vi.setSystemTime(now);
    await t.action(internal.featuredProjects.recomputeFeatured, {});

    expect(await featuredTitles()).toEqual([
      "Recent favourite",
      "Older favourite",
      "No favourites",
    ]);
  });

  it("breaks ties within a window by newer project", async () => {
    vi.setSystemTime(now - 5 * DAY_MS);
    const first = await insertProject("First");
    vi.setSystemTime(now - 4 * DAY_MS);
    const second = await insertProject("Second");
    await favourite(first, 1);
    await favourite(second, 1);

    vi.setSystemTime(now);
    await t.action(internal.featuredProjects.recomputeFeatured, {});

    expect(await featuredTitles()).toEqual(["Second", "First"]);
  });

  it("excludes unpublished projects from the snapshot and fallback", async () => {
    const visible = await insertProject("Visible");
    const hidden = await insertProject("Hidden");
    await t.run((ctx) => ctx.db.patch(hidden, { published: false }));
    expect(await featuredTitles()).toEqual(["Visible"]);

    await favourite(visible, 1);
    await favourite(hidden, 3);
    await t.action(internal.featuredProjects.recomputeFeatured, {});
    expect(await featuredTitles()).toEqual(["Visible"]);
  });

  it("deleteProject removes the project from the snapshot", async () => {
    const keep = await insertProject("Keep");
    const drop = await insertProject("Drop");
    await favourite(keep, 1);
    await favourite(drop, 2);
    await t.action(internal.featuredProjects.recomputeFeatured, {});

    await t.mutation(api.project.deleteProject, { _id: drop });

    expect(await featuredTitles()).toEqual(["Keep"]);
    const rows = await t.run((ctx) =>
      ctx.db.query("featuredProjects").collect(),
    );
    expect(rows.map((r) => r.projectId)).toEqual([keep]);
  });
});
