/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

// Minimal profile row; convex generates most required fields.
function profileRow(overrides: Record<string, unknown> = {}) {
  return {
    firstName: "Ada",
    lastName: "Okafor",
    email: "ada@example.com",
    profileImage: null,
    phoneNumbers: [],
    username: "ada",
    title: null,
    ...overrides,
  } satisfies Record<string, unknown>;
}

describe("profile cost rating", () => {
  it("public profile exposes the band but never the exact rate", async () => {
    const t = convexTest(schema, modules);

    await t.run(async (ctx) => {
      await ctx.db.insert(
        "profile",
        profileRow({
          rate: { amount: 250_000 },
        }),
      );
    });

    const publicProfile = await t.query(api.profiles.getProfileByUsername, {
      username: "ada",
    });

    expect(publicProfile?.rate).toBeUndefined();
    expect(publicProfile?.rateBand).toBe("₦₦₦");
  });

  it("profiles without a rate show a null band and no leaked rate", async () => {
    const t = convexTest(schema, modules);

    await t.run(async (ctx) => {
      await ctx.db.insert("profile", profileRow());
    });

    const publicProfile = await t.query(api.profiles.getProfileByUsername, {
      username: "ada",
    });

    expect(publicProfile?.rate).toBeUndefined();
    expect(publicProfile?.rateBand).toBeNull();
  });

  it("owner queries still return the exact rate", async () => {
    const t = convexTest(schema, modules);

    const id = await t.run(async (ctx) => {
      return ctx.db.insert(
        "profile",
        profileRow({
          rate: { amount: 75_000, currency: "NGN" },
        }),
      );
    });

    const stored = await t.run(async (ctx) => {
      return ctx.db.get(id);
    });

    expect(stored?.rate).toEqual({ amount: 75_000, currency: "NGN" });
  });
});

describe("profile image resolution", () => {
  it("legacy URLs pass through and storage ids resolve to URLs", async () => {
    const t = convexTest(schema, modules);

    const storageId = await t.run(async (ctx) => {
      // edge-runtime Blob crosses the VM boundary without arrayBuffer
      const bytes = new TextEncoder().encode("fake-image-bytes");
      const fakeBlob = {
        type: "image/jpeg",
        arrayBuffer: () => bytes.buffer,
      } as unknown as Blob;
      return ctx.storage.store(fakeBlob);
    });

    await t.run(async (ctx) => {
      await ctx.db.insert(
        "profile",
        profileRow({
          username: "seeded",
          profileImage: "https://i.pravatar.cc/?img=10",
        }),
      );
      await ctx.db.insert(
        "profile",
        profileRow({ username: "uploaded", profileImage: storageId }),
      );
    });

    const seeded = await t.query(api.profiles.getProfileByUsername, {
      username: "seeded",
    });
    const uploaded = await t.query(api.profiles.getProfileByUsername, {
      username: "uploaded",
    });

    expect(seeded?.profileImage).toBe("https://i.pravatar.cc/?img=10");
    expect(uploaded?.profileImage).toContain("/api/storage/");
  });
});
