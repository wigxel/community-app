import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const link_schema = v.array(
  v.object({
    tag: v.string(),
    value: v.string(),
    title: v.string(),
  }),
);

const deprecated_projects_schema = v.array(
  v.object({
    title: v.string(),
    timeline: v.object({
      start: v.number(),
      end: v.number(),
    }),
    description: v.string(),
    media: v.array(
      v.object({
        type: v.union(v.literal("photo"), v.literal("pdf"), v.literal("video")),
        metadata: v.any(),
      }),
    ),
    link: v.array(v.string()),
  }),
);

const project_media_schema = v.object({
  type: v.union(v.literal("photo"), v.literal("pdf"), v.literal("video")),
  metadata: v.object({
    url: v.string(),
    title: v.optional(v.string()),
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    duration: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    storageId: v.optional(v.string()),
  }),
});

const project_link_schema = v.object({
  tag: v.union(
    v.literal("github"),
    v.literal("live"),
    v.literal("figma"),
    v.literal("behance"),
    v.literal("docs"),
    v.literal("other"),
  ),
  value: v.string(),
});

export const project_schema = {
  userId: v.string(),
  title: v.string(),
  timeline: v.object({
    start: v.union(
      v.null(),
      v.object({ year: v.string() }),
      v.object({ month: v.string(), year: v.string() }),
    ),
    end: v.union(
      v.null(),
      v.object({ year: v.string() }),
      v.object({ month: v.string(), year: v.string() }),
    ),
  }),
  ongoing: v.boolean(),
  description: v.string(),
  media: v.array(project_media_schema),
  link: v.array(project_link_schema),
};

const profile_location_schema = v.object({
  city: v.string(),
  country: v.string(),
});

const profile_work_experience_schema = v.array(
  v.object({
    position: v.string(),
    company: v.string(),
    startDate: v.number(),
    endDate: v.optional(v.union(v.number(), v.null())),
    description: v.optional(v.string()),
  }),
);

const work_experience_schema = v.object({
  userId: v.string(),
  logo: v.optional(v.string()),
  companyName: v.string(),
  location: v.union(
    v.literal("remote"),
    v.literal("hybrid"),
    v.literal("onsite"),
  ),
  type: v.union(v.literal("contract"), v.literal("full-time")),
  timeline: v.object({
    start: v.number(),
    end: v.optional(v.number()),
  }),
  description: v.string(),
  position: v.string(),
});

const schema = defineSchema({
  titles: defineTable({
    name: v.string(),
    description: v.nullable(v.string()),
    color: v.optional(v.string()),
  }),
  profile: defineTable({
    userId: v.optional(v.string()),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    profileImage: v.nullable(v.string()),
    phoneNumbers: v.array(v.string()),
    username: v.string(),
    title: v.nullable(v.id("titles")),
    links: v.optional(link_schema),
    shortBio: v.optional(v.nullable(v.string())),
    projects: v.optional(deprecated_projects_schema),
    workExperience: v.optional(profile_work_experience_schema),
    interests: v.optional(v.array(v.string())),
    location: v.optional(profile_location_schema),
  })
    .index("by_username", ["username"])
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  project: defineTable(project_schema).index("by_userId", ["userId"]),

  workExperience: defineTable(work_experience_schema).index("by_userId", [
    "userId",
  ]),
});

export default schema;
