/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it, vi } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { rankFeatured } from "./featured";

const modules = import.meta.glob("./**/*.ts");

vi.mock("./auth", () => ({
  authComponent: {
    getAuthUser: vi.fn(),
  },
}));

const NOW = 1_800_000_000_000;
const DAY = 24 * 60 * 60 * 1000;

function fav(
  projectId: Id<"project">,
  favouritedAt: number,
  projectCreatedAt = favouritedAt,
) {
  return { projectId, favouritedAt, projectCreatedAt };
}

function projectIds(count: number): Array<Id<"project">> {
  return Array.from(
    { length: count },
    (_, i) => `proj${i}` as unknown as Id<"project">,
  );
}

describe("rankFeatured", () => {
  it("prefers the recent window over an older, more-favourited one", () => {
    const [a, b] = projectIds(2);

    // `a` has more favourites overall, but all 40+ days old.
    const favourites = [
      ...Array.from({ length: 5 }, (_, i) => fav(a, NOW - 40 * DAY - i)),
      ...Array.from({ length: 2 }, (_, i) => fav(b, NOW - DAY - i)),
    ];

    const ranked = rankFeatured(favourites, [], NOW);

    expect(ranked.map((r) => r.projectId)).toEqual([b, a]);
    expect(ranked[0].favouriteCount).toBe(2);
    expect(ranked[1].favouriteCount).toBe(5);
  });

  it("tie-breaks equal counts by newer project", () => {
    const [old, recent] = projectIds(2);

    const favourites = [
      fav(old, NOW - DAY, NOW - 90 * DAY),
      fav(recent, NOW - 2 * DAY, NOW - DAY),
    ];

    expect(rankFeatured(favourites, [], NOW).map((r) => r.projectId)).toEqual([
      recent,
      old,
    ]);
  });

  it("does not re-rank a project in a later window", () => {
    const [a, b] = projectIds(2);

    // `a` won the recent window with 2 favourites; it also has 6 older ones.
    // `b` has 5 in that older window. Without dedupe, `a` would be re-picked
    // in the older window with count 6 and its recent slot lost.
    const favourites = [
      fav(a, NOW - DAY),
      fav(a, NOW - 2 * DAY),
      ...Array.from({ length: 6 }, (_, i) => fav(a, NOW - 35 * DAY - i)),
      ...Array.from({ length: 5 }, (_, i) => fav(b, NOW - 35 * DAY - i)),
    ];

    const ranked = rankFeatured(favourites, [], NOW);

    expect(ranked.map((r) => r.projectId)).toEqual([a, b]);
    expect(ranked.map((r) => r.favouriteCount)).toEqual([2, 5]);
  });

  it("pads with backfill projects it has not already ranked", () => {
    const [a, b] = projectIds(2);

    const ranked = rankFeatured(
      [fav(a, NOW - DAY)],
      [
        { projectId: a, projectCreatedAt: NOW - DAY },
        { projectId: b, projectCreatedAt: NOW - 2 * DAY },
      ],
      NOW,
    );

    expect(ranked.map((r) => r.projectId)).toEqual([a, b]);
    expect(ranked[1].favouriteCount).toBe(0);
  });

  it("caps the ranking at 20 projects", () => {
    const ids = projectIds(30);
    const favourites = ids.map((projectId, i) => fav(projectId, NOW - i * DAY));

    expect(rankFeatured(favourites, [], NOW)).toHaveLength(20);
  });
});

describe("featured snapshot", () => {
  function validProject(overrides?: Record<string, unknown>) {
    return {
      userId: "user_test_123",
      title: "Test Project",
      description: "A test project",
      timeline: { start: { year: "2024" }, end: null },
      ongoing: true,
      media: [],
      link: [],
      ...overrides,
    };
  }

  it("recomputes the snapshot into rank order and falls back while empty", async () => {
    const t = convexTest(schema, modules);

    // Inserted oldest → newest: newest-first order is c, b, a.
    const a = await t.run((ctx) =>
      ctx.db.insert("project", validProject({ title: "A" })),
    );
    const b = await t.run((ctx) =>
      ctx.db.insert("project", validProject({ title: "B" })),
    );
    const c = await t.run((ctx) =>
      ctx.db.insert("project", validProject({ title: "C" })),
    );
    await t.run((ctx) =>
      ctx.db.insert(
        "project",
        validProject({ title: "Hidden", published: false }),
      ),
    );

    // Empty snapshot → live fallback, latest published first.
    expect(
      (await t.query(api.featured.listFeatured, {})).map((p) => p.title),
    ).toEqual(["C", "B", "A"]);

    // Two favourites on B, one on A; the unpublished project is ignored.
    await t.run(async (ctx) => {
      await ctx.db.insert("projectFavourites", { userId: "u1", projectId: b });
      await ctx.db.insert("projectFavourites", { userId: "u2", projectId: b });
      await ctx.db.insert("projectFavourites", { userId: "u1", projectId: a });
      await ctx.db.insert("projectFavourites", { userId: "u2", projectId: c });
      await ctx.db.delete(c);
    });

    await t.action(internal.featured.recomputeFeatured, { now: Date.now() });

    const snapshot = await t.run((ctx) =>
      ctx.db.query("featuredProjects").collect(),
    );
    const byRank = snapshot.sort((x, y) => x.rank - y.rank);

    // C was deleted after being favourited, so only A and B survive.
    expect(byRank.map((r) => r.rank)).toEqual([1, 2]);
    expect(byRank.map((r) => r.favouriteCount)).toEqual([2, 1]);

    const featured = await t.query(api.featured.listFeatured, {});
    expect(featured.map((p) => p.title)).toEqual(["B", "A"]);
  });
});
