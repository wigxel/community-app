/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

const OWNER = "user_owner_1";
const OTHER = "user_owner_2";

// Keeps the schema generic so index names inside t.run type-check.
const makeTest = () => convexTest(schema, modules);

function projectFor(userId: string) {
  return {
    userId,
    title: "Test Project",
    description: "A test project",
    timeline: { start: { year: "2024" }, end: null },
    ongoing: true,
    media: [],
    link: [],
  };
}

describe("seeds.backfillProjectCounts", () => {
  let t: ReturnType<typeof makeTest>;

  beforeEach(() => {
    vi.useFakeTimers();
    t = makeTest();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const run = () => t.mutation(internal.seeds.backfillProjectCounts, {});
  const runForced = () =>
    t.mutation(internal.seeds.backfillProjectCounts, { force: true });

  const insertProfile = (fields: { username: string; userId?: string }) =>
    t.run((ctx) =>
      ctx.db.insert("profile", {
        firstName: "Test",
        lastName: "User",
        email: `${fields.username}@example.com`,
        profileImage: null,
        phoneNumbers: [],
        username: fields.username,
        title: null,
        ...(fields.userId === undefined ? {} : { userId: fields.userId }),
      }),
    );

  const getProfile = (id: Id<"profile">) => t.run((ctx) => ctx.db.get(id));

  const migrationRows = () =>
    t.run((ctx) =>
      ctx.db
        .query("migrations")
        .withIndex("by_name", (q) => q.eq("name", "backfill:projectCounts"))
        .collect(),
    );

  it("counts each owner's projects onto their profile", async () => {
    const alice = await insertProfile({ username: "alice", userId: OWNER });
    const bob = await insertProfile({ username: "bob", userId: OTHER });

    await t.run(async (ctx) => {
      await ctx.db.insert("project", projectFor(OWNER));
      await ctx.db.insert("project", projectFor(OWNER));
      await ctx.db.insert("project", projectFor(OWNER));
      await ctx.db.insert("project", projectFor(OTHER));
    });

    const result = await run();

    expect(result).toMatchObject({
      done: true,
      updated: 2,
      skippedNoUserId: 0,
    });
    expect((await getProfile(alice))?.projectCount).toBe(3);
    expect((await getProfile(bob))?.projectCount).toBe(1);
  });

  it("writes 0 for a profile whose owner has no projects", async () => {
    const carol = await insertProfile({
      username: "carol",
      userId: "user_with_none",
    });

    const result = await run();

    expect(result).toMatchObject({
      done: true,
      updated: 1,
      skippedNoUserId: 0,
    });
    expect((await getProfile(carol))?.projectCount).toBe(0);
  });

  it("leaves profiles with no userId untouched and reports them", async () => {
    const legacy = await insertProfile({ username: "legacy" });

    const result = await run();

    expect(result).toMatchObject({
      done: true,
      updated: 0,
      skippedNoUserId: 1,
    });
    expect((await getProfile(legacy))?.projectCount).toBeUndefined();
    expect(await migrationRows()).toHaveLength(1);
  });

  it("refuses to re-run once the migration is recorded", async () => {
    const alice = await insertProfile({ username: "alice", userId: OWNER });
    await run();

    // Drift the counter, then attempt a plain re-run.
    await t.run((ctx) => ctx.db.patch(alice, { projectCount: 99 }));
    const second = await run();

    expect(second).toMatchObject({ alreadyRan: true, updated: 0 });
    expect((await getProfile(alice))?.projectCount).toBe(99);
  });

  it("force re-runs past the guard and repairs drift", async () => {
    const alice = await insertProfile({ username: "alice", userId: OWNER });
    await t.run((ctx) => ctx.db.insert("project", projectFor(OWNER)));
    await run();

    await t.run((ctx) => ctx.db.patch(alice, { projectCount: 99 }));
    const forced = await runForced();

    expect(forced).toMatchObject({ done: true, updated: 1 });
    expect((await getProfile(alice))?.projectCount).toBe(1);
  });

  it("continues in a fresh transaction past the 100-profile batch", async () => {
    const ids = await t.run(async (ctx) => {
      const out: Id<"profile">[] = [];
      for (let i = 0; i < 101; i++) {
        out.push(
          await ctx.db.insert("profile", {
            firstName: "Test",
            lastName: "User",
            email: `user${i}@example.com`,
            profileImage: null,
            phoneNumbers: [],
            username: `user_${String(i).padStart(3, "0")}`,
            title: null,
            userId: `owner_${i}`,
          }),
        );
      }
      return out;
    });

    await t.run((ctx) => ctx.db.insert("project", projectFor("owner_50")));

    const first = await run();

    // First transaction stops at the batch boundary and schedules the rest.
    expect(first).toMatchObject({ done: false, updated: 100 });

    await t.finishAllScheduledFunctions(vi.runAllTimers);

    expect((await getProfile(ids[50]))?.projectCount).toBe(1);
    expect((await getProfile(ids[0]))?.projectCount).toBe(0);
    expect((await getProfile(ids[100]))?.projectCount).toBe(0);
    expect(await migrationRows()).toHaveLength(1);
  });
});
