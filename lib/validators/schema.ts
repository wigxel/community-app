import z from "zod";
import type { Id } from "~/convex/_generated/dataModel";

export const timelineDate = z.union([
  z.null(),
  z.object({ year: z.string() }),
  z.object({ month: z.string(), year: z.string() }),
]);

export const mediaSchema = z.object({
  type: z.enum(["photo", "pdf", "video"]),
  metadata: z.object({
    url: z.string(),
    title: z
      .string()
      .max(100, { message: "Title cannot exceed 100 characters." })
      .optional(),
    filename: z.string(),
    mimeType: z.string(),
    size: z.number(),
    duration: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    storageId: z.string().optional(),
  }),
});

export const projectLinkSchema = z.object({
  tag: z.enum(["github", "live", "figma", "behance", "docs", "other"]),
  value: z.url({ message: "Please enter a  a valid URL." }),
});

export const projectSchema = z.object({
  _id: z.custom<Id<"project">>().optional(),
  userId: z.string(),
  title: z
    .string()
    .min(1, { message: "Title is required." })
    .max(100, { message: "Title cannot exceed 100 characters." }),
  description: z
    .string()
    .max(300, { message: "Description cannot exceed 300 characters." }),
  timeline: z.object({
    start: timelineDate,
    end: timelineDate,
  }),
  ongoing: z.boolean(),
  media: z.array(mediaSchema),
  link: z.array(projectLinkSchema),
});
