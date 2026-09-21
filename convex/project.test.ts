/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

const FAKE_USER = { _id: "user_test_123", email: "test@example.com" };

vi.mock("./auth", () => ({
  authComponent: {
    getAuthUser: vi.fn(),
  },
}));

import { authComponent } from "./auth";
const mockGetAuthUser = vi.mocked(
  authComponent.getAuthUser,
) as unknown as ReturnType<typeof vi.fn>;

function validProject(overrides?: Record<string, unknown>) {
  return {
    userId: FAKE_USER._id,
    title: "Test Project",
    description: "A test project",
    timeline: {
      start: { year: "2024" },
      end: null,
    },
    ongoing: true,
    media: [],
    link: [],
    ...overrides,
  };
}

describe("project mutations — link guards", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    vi.useFakeTimers();
    t = convexTest(schema, modules);
    mockGetAuthUser.mockResolvedValue(FAKE_USER as any);
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("createProject", () => {
    it("throws on more than 3 links", async () => {
      await expect(
        t.mutation(api.project.createProject, {
          project: validProject({
            link: [
              { tag: "github", value: "https://github.com/a" },
              { tag: "figma", value: "https://figma.com/b" },
              { tag: "behance", value: "https://behance.net/c" },
              { tag: "other", value: "https://example.com" },
            ],
          }),
        }),
      ).rejects.toThrow("Max of 3 links per project");
    });

    it("throws on duplicate non-other tags", async () => {
      await expect(
        t.mutation(api.project.createProject, {
          project: validProject({
            link: [
              { tag: "github", value: "https://github.com/a" },
              { tag: "github", value: "https://github.com/b" },
            ],
          }),
        }),
      ).rejects.toThrow("Duplicate link types are not allowed");
    });

    it("allows multiple other tags", async () => {
      await expect(
        t.mutation(api.project.createProject, {
          project: validProject({
            link: [
              { tag: "other", value: "https://one.com" },
              { tag: "other", value: "https://two.com" },
              { tag: "other", value: "https://three.com" },
            ],
          }),
        }),
      ).resolves.toBeDefined();
    });

    it("allows unique non-other with other", async () => {
      await expect(
        t.mutation(api.project.createProject, {
          project: validProject({
            link: [
              { tag: "github", value: "https://github.com/a" },
              { tag: "figma", value: "https://figma.com/b" },
              { tag: "other", value: "https://one.com" },
            ],
          }),
        }),
      ).resolves.toBeDefined();
    });

    it("succeeds with 3 valid unique links", async () => {
      await expect(
        t.mutation(api.project.createProject, {
          project: validProject({
            link: [
              { tag: "github", value: "https://github.com/a" },
              { tag: "figma", value: "https://figma.com/b" },
              { tag: "behance", value: "https://behance.net/c" },
            ],
          }),
        }),
      ).resolves.toBeDefined();
    });

    it("throws when not authenticated", async () => {
      mockGetAuthUser.mockResolvedValue(null);
      await expect(
        t.mutation(api.project.createProject, {
          project: validProject(),
        }),
      ).rejects.toThrow("Not authenticated");
    });
  });

  describe("updateProject", () => {
    let projectId: string;

    beforeEach(async () => {
      await t.mutation(api.project.createProject, {
        project: validProject(),
      });
      await t.finishInProgressScheduledFunctions();
      const projects = await t.query(api.project.listProjectByUserId, {
        userId: FAKE_USER._id,
      });
      projectId = projects[0]._id;
    });

    it("throws on more than 3 links", async () => {
      await expect(
        t.mutation(api.project.updateProject, {
          project: {
            _id: projectId,
            ...validProject({
              link: [
                { tag: "github", value: "https://github.com/a" },
                { tag: "figma", value: "https://figma.com/b" },
                { tag: "behance", value: "https://behance.net/c" },
                { tag: "other", value: "https://example.com" },
              ],
            }),
          },
        }),
      ).rejects.toThrow("Max of 3 links per project");
    });

    it("throws on duplicate non-other tags", async () => {
      await expect(
        t.mutation(api.project.updateProject, {
          project: {
            _id: projectId,
            ...validProject({
              link: [
                { tag: "github", value: "https://github.com/a" },
                { tag: "github", value: "https://github.com/b" },
              ],
            }),
          },
        }),
      ).rejects.toThrow("Duplicate link types are not allowed");
    });

    it("allows multiple other tags", async () => {
      await expect(
        t.mutation(api.project.updateProject, {
          project: {
            _id: projectId,
            ...validProject({
              link: [
                { tag: "other", value: "https://one.com" },
                { tag: "other", value: "https://two.com" },
                { tag: "other", value: "https://three.com" },
              ],
            }),
          },
        }),
      ).resolves.toBeDefined();
    });
  });
});
