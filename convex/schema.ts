import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const link_schema = v.array(
  v.object({
    tag: v.string(),
    value: v.string(),
    title: v.string(),
  }),
);

const media_schema = v.object({
  type: v.union(v.literal("photo"), v.literal("pdf"), v.literal("video")),
  metadata: v.any(),
});

const project_schema = v.array(
  v.object({
    title: v.string(),
    timeline: v.object({
      start: v.number(),
      end: v.number(),
    }),
    description: v.string(),
    media: v.array(media_schema),
    link: v.optional(v.array(v.string())),
  }),
);

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
    projects: v.optional(project_schema),
    workExperience: v.optional(profile_work_experience_schema),
    interests: v.optional(v.array(v.string())),
  })
    .index("by_username", ["username"])
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  workExperience: defineTable(work_experience_schema).index("by_userId", [
    "userId",
  ]),
});

export default schema;
